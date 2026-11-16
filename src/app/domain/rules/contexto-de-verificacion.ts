import { Asignatura, Franja, Parametros, Seccion, Sesion } from '../models';
import { formatoFranja } from '../services/formato';

/** Sesión que ya tiene día y hora. */
export type SesionProgramada = Sesion & { readonly franja: Franja };

/**
 * Todo lo que una regla necesita para evaluarse: las sesiones del bloque,
 * sus secciones y asignaturas, y los parámetros vigentes.
 */
export class ContextoDeVerificacion {
  private readonly seccionPorId: Map<string, Seccion>;
  private readonly asignaturaPorId: Map<string, Asignatura>;

  constructor(
    readonly sesiones: readonly Sesion[],
    readonly secciones: readonly Seccion[],
    asignaturas: readonly Asignatura[],
    readonly parametros: Parametros,
  ) {
    this.seccionPorId = new Map(secciones.map((s) => [s.id, s]));
    this.asignaturaPorId = new Map(asignaturas.map((a) => [a.id, a]));
  }

  programadas(): SesionProgramada[] {
    return this.sesiones.filter((s): s is SesionProgramada => s.franja !== null);
  }

  seccion(sesion: Sesion): Seccion {
    const seccion = this.seccionPorId.get(sesion.seccionId);
    if (!seccion) throw new Error(`La sesión ${sesion.id} no tiene sección`);
    return seccion;
  }

  asignaturaDeSeccion(seccion: Seccion): Asignatura {
    const asignatura = this.asignaturaPorId.get(seccion.asignaturaId);
    if (!asignatura) throw new Error(`La sección ${seccion.id} no tiene asignatura`);
    return asignatura;
  }

  asignatura(sesion: Sesion): Asignatura {
    return this.asignaturaDeSeccion(this.seccion(sesion));
  }

  sesionesDeSeccion(seccionId: string): Sesion[] {
    return this.sesiones.filter((s) => s.seccionId === seccionId);
  }

  horaFin(franja: Franja): number {
    return franja.horaInicio + this.parametros.duracionSesionHoras;
  }

  /** Dos sesiones programadas se cruzan si son el mismo día y sus horas se solapan. */
  seCruzan(a: SesionProgramada, b: SesionProgramada): boolean {
    return (
      a.franja.dia === b.franja.dia &&
      a.franja.horaInicio < this.horaFin(b.franja) &&
      b.franja.horaInicio < this.horaFin(a.franja)
    );
  }

  /** «Bases de datos 1 sección 01». */
  describirSeccion(seccion: Seccion): string {
    return `${this.asignaturaDeSeccion(seccion).nombre} sección ${seccion.numero}`;
  }

  /** «Bases de datos 1 sección 01, martes 9:00–11:00». */
  describir(sesion: Sesion): string {
    const texto = this.describirSeccion(this.seccion(sesion));
    return sesion.franja
      ? `${texto}, ${formatoFranja(sesion.franja, this.parametros.duracionSesionHoras)}`
      : texto;
  }
}
