import { Incumplimiento } from '../models';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla, crearIncumplimiento } from './regla';

/** RN-05: las sesiones de secciones de un mismo bloque de semestre no se cruzan entre sí. */
export class Rn05CruceEnBloque implements Regla {
  readonly id = 'RN-05';
  readonly tipo = 'restriccion' as const;
  readonly descripcion =
    'Las sesiones de secciones de un mismo bloque de semestre no se cruzan entre sí';

  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    const programadas = contexto.programadas();
    const incumplimientos: Incumplimiento[] = [];
    for (let i = 0; i < programadas.length; i++) {
      for (let j = i + 1; j < programadas.length; j++) {
        const a = programadas[i];
        const b = programadas[j];
        const bloqueA = contexto.seccion(a).bloqueId;
        const mismoBloque = bloqueA !== null && bloqueA === contexto.seccion(b).bloqueId;
        if (a.seccionId !== b.seccionId && mismoBloque && contexto.seCruzan(a, b)) {
          incumplimientos.push(
            crearIncumplimiento(this, [a.id, b.id], [contexto.describir(a), contexto.describir(b)]),
          );
        }
      }
    }
    return incumplimientos;
  }
}
