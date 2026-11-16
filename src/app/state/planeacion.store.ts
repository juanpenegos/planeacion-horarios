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
  planeacionVacia,
} from '../domain/models';
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

  readonly sesionesDelGrupo = computed<readonly Sesion[]>(
    () => this.editor.contextoDe(this.estado(), this.bloqueIdSeleccionado()).sesiones,
  );

  readonly incumplimientos = computed<Incumplimiento[]>(() =>
    this.verificador.verificar(this.editor.contextoDe(this.estado(), this.bloqueIdSeleccionado())),
  );

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

  programar(sesionId: string, franja: Franja): void {
    this.estado.update((p) => this.editor.programar(p, sesionId, franja));
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
