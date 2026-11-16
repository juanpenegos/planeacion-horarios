import { Incumplimiento } from '../models';
import { ContextoDeVerificacion } from '../rules/contexto-de-verificacion';
import { RegistroDeReglas } from '../rules/registro-de-reglas';

/**
 * Evalúa todas las reglas registradas sobre un bloque. No conoce ninguna regla
 * en particular: agregar una regla no obliga a cambiar esta clase (ENF-06).
 */
export class Verificador {
  constructor(private readonly registro: RegistroDeReglas) {}

  verificar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    return this.registro.todas().flatMap((regla) => regla.evaluar(contexto));
  }
}
