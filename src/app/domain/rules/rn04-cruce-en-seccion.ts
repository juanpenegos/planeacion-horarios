import { Incumplimiento } from '../models';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla, crearIncumplimiento } from './regla';

/** RN-04: dos sesiones de una misma sección no se cruzan entre sí. */
export class Rn04CruceEnSeccion implements Regla {
  readonly id = 'RN-04';
  readonly tipo = 'restriccion' as const;
  readonly descripcion = 'Dos sesiones de una misma sección no se cruzan entre sí';

  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    const programadas = contexto.programadas();
    const incumplimientos: Incumplimiento[] = [];
    for (let i = 0; i < programadas.length; i++) {
      for (let j = i + 1; j < programadas.length; j++) {
        const a = programadas[i];
        const b = programadas[j];
        if (a.seccionId === b.seccionId && contexto.seCruzan(a, b)) {
          incumplimientos.push(
            crearIncumplimiento(
              this,
              [a.id, b.id],
              [
                `${contexto.describir(a)} (sesión ${a.numero})`,
                `${contexto.describir(b)} (sesión ${b.numero})`,
              ],
            ),
          );
        }
      }
    }
    return incumplimientos;
  }
}
