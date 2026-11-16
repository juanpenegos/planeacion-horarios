import { DIAS, Incumplimiento } from '../models';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla, crearIncumplimiento } from './regla';

/** RA-01: las sesiones de una sección con dos o tres sesiones no quedan en días consecutivos. */
export class Ra01DiasConsecutivos implements Regla {
  readonly id = 'RA-01';
  readonly tipo = 'advertencia' as const;
  readonly descripcion =
    'Las sesiones de una sección con dos o tres sesiones no quedan en días consecutivos';

  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    const programadas = contexto.programadas();
    const incumplimientos: Incumplimiento[] = [];
    for (let i = 0; i < programadas.length; i++) {
      for (let j = i + 1; j < programadas.length; j++) {
        const a = programadas[i];
        const b = programadas[j];
        if (a.seccionId !== b.seccionId) continue;
        const total = contexto.sesionesDeSeccion(a.seccionId).length;
        const distancia = Math.abs(DIAS.indexOf(a.franja.dia) - DIAS.indexOf(b.franja.dia));
        if ((total === 2 || total === 3) && distancia === 1) {
          incumplimientos.push(
            crearIncumplimiento(
              this,
              [a.id, b.id],
              [contexto.describir(a), `${contexto.describir(b)} en días consecutivos`],
            ),
          );
        }
      }
    }
    return incumplimientos;
  }
}
