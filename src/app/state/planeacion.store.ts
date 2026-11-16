import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AsignaturasRepository } from '../data/asignaturas.repository';
import { ArchivoDePlaneacion } from '../data/archivo-de-planeacion';
import { PlaneacionRepository } from '../data/planeacion.repository';
import {
  Franja,
  Incumplimiento,
  Parametros,
  Planeacion,
  Semestre,
  Sesion,
  nombreDeBloque,
  planeacionVacia,
} from '../domain/models';
import { formatoFranja } from '../domain/services/formato';
import { cabeEnHorario, iniciosPorDia } from '../domain/services/franjas';
import { VistaDeSesion } from './vista-de-sesion';
import { crearRegistroDelDominio } from '../domain/rules/registro-de-reglas';
import { EditorDePlaneacion } from '../domain/services/editor-de-planeacion';
import { PlanDeEstudios } from '../domain/services/plan-de-estudios';
import { EstadoDeSesion, ResumenDeBloque } from '../domain/services/resumen-de-bloque';
import { Verificador } from '../domain/services/verificador';

/** Identificador del grupo de secciones fuera de bloque en el selector. */
export const FUERA_DE_BLOQUE = 'fuera-de-bloque';

/**
 * Almacén de la planeación con signals. Une datos, reglas y verificación:
 * cada cambio se verifica sobre todo el bloque y se guarda al instante.
 */
@Injectable({ providedIn: 'root' })
export class PlaneacionStore {
  private readonly repositorio = inject(PlaneacionRepository);
  private readonly archivo = new ArchivoDePlaneacion();
  private readonly verificador = new Verificador(crearRegistroDelDominio());
  private readonly resumidor = new ResumenDeBloque();

  readonly plan = new PlanDeEstudios(inject(AsignaturasRepository).todas());
  private readonly editor = new EditorDePlaneacion(this.plan);

  private readonly estado = signal<Planeacion>(this.repositorio.cargar() ?? planeacionVacia());
  readonly planeacion = this.estado.asReadonly();
  readonly parametros = computed(() => this.estado().parametros);

  /** Bloque elegido en el selector («IV-01» o «fuera-de-bloque»). */
  readonly grupoSeleccionado = signal<string>(this.estado().bloques[0]?.id ?? FUERA_DE_BLOQUE);

  private readonly bloqueIdSeleccionado = computed(() =>
    this.grupoSeleccionado() === FUERA_DE_BLOQUE ? null : this.grupoSeleccionado(),
  );

  /** Opciones del selector: los bloques creados y el grupo de fuera de bloque. */
  readonly opcionesDeBloque = computed(() => [
    ...this.estado().bloques.map((b) => ({ id: b.id, nombre: nombreDeBloque(b) })),
    { id: FUERA_DE_BLOQUE, nombre: 'Fuera de bloque (electivas y Trabajo de grado)' },
  ]);

  /** Horas de inicio permitidas por día según los parámetros vigentes. */
  readonly inicios = computed(() => iniciosPorDia(this.parametros()));

  private readonly contexto = computed(() =>
    this.editor.contextoDe(this.estado(), this.bloqueIdSeleccionado()),
  );

  readonly sesionesDelGrupo = computed<readonly Sesion[]>(() => this.contexto().sesiones);

  /** Verificación de todo el bloque; se recalcula con cada cambio. */
  readonly incumplimientos = computed<Incumplimiento[]>(() =>
    this.verificador.verificar(this.contexto()),
  );

  /** Sesiones del bloque listas para mostrarse. */
  readonly vistas = computed<VistaDeSesion[]>(() => {
    const contexto = this.contexto();
    const incumplimientos = this.incumplimientos();
    const duracion = this.parametros().duracionSesionHoras;
    return contexto.sesiones.map((sesion) => {
      const seccion = contexto.seccion(sesion);
      return {
        id: sesion.id,
        asignatura: contexto.asignaturaDeSeccion(seccion).nombre,
        seccion: seccion.numero,
        numero: sesion.numero,
        total: contexto.sesionesDeSeccion(seccion.id).length,
        franja: sesion.franja ? formatoFranja(sesion.franja, duracion) : null,
        ubicacion: sesion.franja,
        estado: this.resumidor.estadoDeSesion(sesion, incumplimientos),
      };
    });
  });

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

  constructor() {
    effect(() => this.repositorio.guardar(this.estado()));
  }

  estadoDeSesion(sesion: Sesion): EstadoDeSesion {
    return this.resumidor.estadoDeSesion(sesion, this.incumplimientos());
  }

  crearBloque(semestre: Semestre): void {
    this.estado.update((p) => this.editor.crearBloque(p, semestre));
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

  exportarJson(): string {
    return this.archivo.exportar(this.estado());
  }

  importarJson(texto: string): void {
    const planeacion = this.archivo.importar(texto);
    this.estado.set(planeacion);
    this.grupoSeleccionado.set(planeacion.bloques[0]?.id ?? FUERA_DE_BLOQUE);
  }
}
