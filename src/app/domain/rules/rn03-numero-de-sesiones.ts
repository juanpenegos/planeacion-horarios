import { Incumplimiento } from '../models';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla, crearIncumplimiento } from './regla';

/**
 * RN-03: cada sección tiene tantas sesiones como resulte de dividir sus horas
 * directas semanales entre la duración de la sesión, sin superar el máximo semanal.
 */
export class Rn03NumeroDeSesiones implements Regla {
  readonly id = 'RN-03';
  readonly tipo = 'restriccion' as const;
  readonly descripcion =
    'Cada sección tiene las sesiones que resultan de sus horas directas, sin superar el máximo semanal';

  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    const { duracionSesionHoras, maximoSesionesSemana } = contexto.parametros;
    const incumplimientos: Incumplimiento[] = [];

    for (const seccion of contexto.secciones) {
      const asignatura = contexto.asignaturaDeSeccion(seccion);
      const esperadas = Math.floor(asignatura.horasDirectasSemana / duracionSesionHoras);
      const sesiones = contexto.sesionesDeSeccion(seccion.id);
      const ids = sesiones.map((s) => s.id);
      const nombre = contexto.describirSeccion(seccion);

      if (esperadas > maximoSesionesSemana) {
        incumplimientos.push(
          crearIncumplimiento(this, ids, [
            `${nombre} requiere ${esperadas} sesiones y el máximo semanal es ${maximoSesionesSemana}`,
          ]),
        );
      } else if (sesiones.length !== esperadas) {
        incumplimientos.push(
          crearIncumplimiento(this, ids, [
            `${nombre} tiene ${sesiones.length} sesiones y debe tener ${esperadas}`,
          ]),
        );
      }
    }
    return incumplimientos;
  }
}
