import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { PlaneacionRepository } from '../data/planeacion.repository';
import {
  Bloque,
  Franja,
  Incumplimiento,
  Parametros,
  Planeacion,
  Semestre,
  Sesion,
  nombreDeBloque,
  planeacionVacia,
} from '../domain/models';
import { ContextoDeVerificacion } from '../domain/rules/contexto-de-verificacion';
import { cabeEnHorario, iniciosPorDia } from '../domain/services/franjas';
import { EstadoDeSesion } from '../domain/services/resumen-de-bloque';
import {
  EDITOR_DE_PLANEACION,
  PLAN_DE_ESTUDIOS,
  RESUMEN_DE_BLOQUE,
  VERIFICADOR,
} from './servicios-del-dominio';
import { VistaDeSesion } from './vista-de-sesion';
import {
  FUERA_DE_BLOQUE,
  GrupoDeSecciones,
  armarGruposDeSecciones,
  armarVistasDeSesion,
} from './vistas';

export { FUERA_DE_BLOQUE } from './vistas';
export type { GrupoDeSecciones, VistaDeSeccion } from './vistas';

/**
 * Almacén de la planeación con signals. Guarda el estado, aplica los cambios con el
 * editor del dominio y expone la verificación del bloque elegido. Los servicios que usa
 * le llegan por inyección; la exportación e importación viven en ExportacionDePlaneacion.
 */
@Injectable({ providedIn: 'root' })
export class PlaneacionStore {
  private readonly repositorio = inject(PlaneacionRepository);
  private readonly verificador = inject(VERIFICADOR);
  private readonly resumidor = inject(RESUMEN_DE_BLOQUE);
  private readonly editor = inject(EDITOR_DE_PLANEACION);
  readonly plan = inject(PLAN_DE_ESTUDIOS);

  private readonly estado = signal<Planeacion>(this.repositorio.cargar() ?? planeacionVacia());
  readonly planeacion = this.estado.asReadonly();
  readonly parametros = computed(() => this.estado().parametros);

  /** Bloque elegido en el selector («IV-01» o «fuera-de-bloque»). */
  readonly grupoSeleccionado = signal<string>(this.estado().bloques[0]?.id ?? FUERA_DE_BLOQUE);

  private readonly bloqueIdSeleccionado = computed(() =>
    this.grupoSeleccionado() === FUERA_DE_BLOQUE ? null : this.grupoSeleccionado(),
  );

  /** Bloque de semestre elegido, o indefinido si se eligió «fuera de bloque». */
  readonly bloqueSeleccionado = computed<Bloque | undefined>(() => {
    const id = this.bloqueIdSeleccionado();
    return id === null ? undefined : this.editor.bloque(this.estado(), id);
  });

  /** Opciones del selector: los bloques creados y el grupo de fuera de bloque. */
  readonly opcionesDeBloque = computed(() => [
    ...this.estado().bloques.map((b) => ({ id: b.id, nombre: nombreDeBloque(b) })),
    { id: FUERA_DE_BLOQUE, nombre: 'Fuera de bloque (electivas y Trabajo de grado)' },
  ]);

  /** Horas de inicio permitidas por día según los parámetros vigentes. */
  readonly inicios = computed(() => iniciosPorDia(this.parametros()));

  /** Sesiones, secciones y parámetros del grupo elegido, listos para verificar o exportar. */
  readonly contextoDelGrupo = computed<ContextoDeVerificacion>(() =>
    this.editor.contextoDe(this.estado(), this.bloqueIdSeleccionado()),
  );

  readonly sesionesDelGrupo = computed<readonly Sesion[]>(() => this.contextoDelGrupo().sesiones);

  /** Verificación de todo el bloque; se recalcula con cada cambio. */
  readonly incumplimientos = computed<Incumplimiento[]>(() =>
    this.verificador.verificar(this.contextoDelGrupo()),
  );

  /** Sesiones del bloque listas para mostrarse. */
  readonly vistas = computed<VistaDeSesion[]>(() =>
    armarVistasDeSesion(this.contextoDelGrupo(), this.incumplimientos(), this.resumidor),
  );

  readonly pendientes = computed(() => this.vistas().filter((v) => v.ubicacion === null));
  readonly programadas = computed(() => this.vistas().filter((v) => v.ubicacion !== null));

  readonly resumen = computed(() =>
    this.resumidor.resumir(this.sesionesDelGrupo(), this.incumplimientos()),
  );

  readonly textoResumen = computed(() => this.resumidor.texto(this.resumen()));

  readonly marcadoComoListo = computed(() => {
    const id = this.bloqueIdSeleccionado();
    return id !== null && this.estado().bloquesMarcados.includes(id);
  });

  /** Bloques con sus secciones y las asignaturas que aún se pueden agregar (HU-03). */
  readonly gruposDeSecciones = computed<GrupoDeSecciones[]>(() =>
    armarGruposDeSecciones(this.estado(), this.plan, this.editor),
  );

  constructor() {
    effect(() => this.repositorio.guardar(this.estado()));
  }

  estadoDeSesion(sesion: Sesion): EstadoDeSesion {
    return this.resumidor.estadoDeSesion(sesion, this.incumplimientos());
  }

  crearBloque(semestre: Semestre): void {
    const antes = this.estado().bloques.length;
    this.estado.update((p) => this.editor.crearBloque(p, semestre));
    const nuevo = this.estado().bloques[antes];
    if (antes === 0 && nuevo) this.grupoSeleccionado.set(nuevo.id);
  }

  /** Crea una sección de cada asignatura del semestre que aún no esté en el bloque. */
  crearSeccionesDelBloque(bloqueId: string): void {
    const grupo = this.gruposDeSecciones().find((g) => g.id === bloqueId);
    for (const asignatura of grupo?.disponibles ?? []) this.crearSeccion(asignatura.id, bloqueId);
  }

  eliminarBloque(bloqueId: string): void {
    this.estado.update((p) => this.editor.eliminarBloque(p, bloqueId));
    if (this.grupoSeleccionado() === bloqueId) this.grupoSeleccionado.set(FUERA_DE_BLOQUE);
  }

  crearSeccion(asignaturaId: string, bloqueId: string | null): void {
    this.estado.update((p) => this.editor.crearSeccion(p, asignaturaId, bloqueId));
  }

  eliminarSeccion(seccionId: string): void {
    this.estado.update((p) => this.editor.eliminarSeccion(p, seccionId));
  }

  /** Programa o mueve una sesión; ignora franjas fuera del horario habilitado (HU-02). */
  programar(sesionId: string, franja: Franja): boolean {
    if (!cabeEnHorario(this.parametros(), franja)) return false;
    this.estado.update((p) => this.editor.programar(p, sesionId, franja));
    return true;
  }

  devolver(sesionId: string): void {
    this.estado.update((p) => this.editor.devolver(p, sesionId));
  }

  cambiarParametros(parametros: Parametros): void {
    this.estado.update((p) => this.editor.cambiarParametros(p, parametros));
  }

  marcarComoListo(): void {
    const id = this.bloqueIdSeleccionado();
    if (id === null) return;
    this.estado.update((p) => this.editor.marcarListo(p, id, this.resumen()));
  }

  /** Reemplaza toda la planeación (por ejemplo, al importar una copia) y elige su primer bloque. */
  reemplazar(planeacion: Planeacion): void {
    this.estado.set(planeacion);
    this.grupoSeleccionado.set(planeacion.bloques[0]?.id ?? FUERA_DE_BLOQUE);
  }
}
