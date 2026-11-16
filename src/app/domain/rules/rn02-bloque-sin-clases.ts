import { Incumplimiento } from '../models';
import { formatoHora } from '../services/formato';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla, crearIncumplimiento } from './regla';

/** RN-02: ninguna sesión se cruza con el bloque sin clases. */
export class Rn02BloqueSinClases implements Regla {
  readonly id = 'RN-02';
  readonly tipo = 'restriccion' as const;
  readonly descripcion = 'Ninguna sesión se cruza con el bloque sin clases';

  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    const bloque = contexto.parametros.bloqueSinClases;
    const texto = `${formatoHora(bloque.inicio)}–${formatoHora(bloque.fin)}`;
    return contexto
      .programadas()
      .filter(
        (sesion) =>
          sesion.franja.horaInicio < bloque.fin && contexto.horaFin(sesion.franja) > bloque.inicio,
      )
      .map((sesion) =>
        crearIncumplimiento(
          this,
          [sesion.id],
          [`${contexto.describir(sesion)} se cruza con el bloque sin clases (${texto})`],
        ),
      );
  }
}
