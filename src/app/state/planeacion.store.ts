import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AsignaturasRepository } from '../data/asignaturas.repository';
import { ArchivoDePlaneacion } from '../data/archivo-de-planeacion';
import { PlaneacionRepository } from '../data/planeacion.repository';
import {
  Asignatura,
  Franja,
  Incumplimiento,
  Parametros,
  Planeacion,
  Semestre,
  Sesion,
  nombreDeBloque,
  planeacionVacia,
} from '../domain/models';
import { ExportadorCsv } from '../domain/services/exportador-csv';
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

/** Sección tal como se lista en la página Secciones. */
export interface VistaDeSeccion {
  readonly id: string;
  readonly asignatura: string;
  readonly numero: string;
  readonly sesiones: number;
  readonly horas: number;
}

/** Un bloque de semestre (o el grupo fuera de bloque) con sus secciones. */
export interface GrupoDeSecciones {
  readonly id: string;
  readonly nombre: string;
  readonly bloqueId: string | null;
  readonly secciones: readonly VistaDeSeccion[];
  /** Asignaturas programables que todavía se pueden agregar. */
  readonly disponibles: readonly Asignatura[];
}

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
  private readonly exportadorCsv = new ExportadorCsv();

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

  /** Bloques con sus secciones y las asignaturas que aún se pueden agregar (HU-03). */
  readonly gruposDeSecciones = computed<GrupoDeSecciones[]>(() => {
    const p = this.estado();
    const vista = (bloqueId: string | null): VistaDeSeccion[] =>
      this.editor.seccionesDe(p, bloqueId).map((s) => ({
        id: s.id,
        asignatura: this.plan.buscar(s.asignaturaId)?.nombre ?? s.asignaturaId,
        numero: s.numero,
        sesiones: p.sesiones.filter((x) => x.seccionId === s.id).length,
        horas: this.plan.buscar(s.asignaturaId)?.horasDirectasSemana ?? 0,
      }));
    const bloques = p.bloques.map((b) => {
      const usadas = new Set(this.editor.seccionesDe(p, b.id).map((s) => s.asignaturaId));
      return {
        id: b.id,
        nombre: nombreDeBloque(b),
        bloqueId: b.id as string | null,
        secciones: vista(b.id),
        disponibles: this.plan.enBloque(b.semestre).filter((a) => !usadas.has(a.id)),
      };
    });
    return [
      ...bloques,
      {
        id: FUERA_DE_BLOQUE,
        nombre: 'Fuera de bloque (electivas de profundización y Trabajo de grado)',
        bloqueId: null,
        secciones: vista(null),
        disponibles: this.plan.fueraDeBloque(),
      },
    ];
  });

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

  /** CSV de la oferta del bloque seleccionado (HU-06), o nulo si no está listo para publicar. */
  exportarCsv(): { nombre: string; contenido: string } | null {
    const id = this.bloqueIdSeleccionado();
    const bloque = id === null ? undefined : this.editor.bloque(this.estado(), id);
    if (!bloque || !this.resumen().listoParaPublicar) return null;
    return {
      nombre: `oferta-semestre-${bloque.semestre}-seccion-${bloque.numero}.csv`,
      contenido: this.exportadorCsv.exportar(this.contexto(), nombreDeBloque(bloque)),
    };
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
