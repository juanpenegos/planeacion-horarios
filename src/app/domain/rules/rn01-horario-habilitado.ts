import { Incumplimiento } from '../models';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla, crearIncumplimiento } from './regla';

/** RN-01: cada sesión inicia y termina dentro del horario habilitado de su día. */
export class Rn01HorarioHabilitado implements Regla {
  readonly id = 'RN-01';
  readonly tipo = 'restriccion' as const;
  readonly descripcion = 'Cada sesión inicia y termina dentro del horario habilitado de su día';

  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    return contexto
      .programadas()
      .filter((sesion) => {
        const horario = contexto.parametros.horarioHabilitado[sesion.franja.dia];
        return (
          sesion.franja.horaInicio < horario.inicio || contexto.horaFin(sesion.franja) > horario.fin
        );
      })
      .map((sesion) =>
        crearIncumplimiento(
          this,
          [sesion.id],
          [`${contexto.describir(sesion)} fuera del horario habilitado`],
        ),
      );
  }
}
