import { Asignatura, Parametros, Seccion, Sesion } from '../models';

/** Crea las sesiones pendientes de una sección según sus horas directas (RN-03). */
export class GeneradorDeSesiones {
  cantidadDeSesiones(asignatura: Asignatura, parametros: Parametros): number {
    return Math.floor(asignatura.horasDirectasSemana / parametros.duracionSesionHoras);
  }

  generar(seccion: Seccion, asignatura: Asignatura, parametros: Parametros): Sesion[] {
    const cantidad = this.cantidadDeSesiones(asignatura, parametros);
    return Array.from({ length: cantidad }, (_, i) => ({
      id: `${seccion.id}-s${i + 1}`,
      seccionId: seccion.id,
      numero: i + 1,
      franja: null,
    }));
  }
}
