import { Incumplimiento, TipoRegla } from '../models';
import { NOMBRE_SEVERIDAD } from '../services/formato';
import { ContextoDeVerificacion } from './contexto-de-verificacion';

/**
 * Regla del dominio. Agregar una regla nueva = crear una clase que implemente
 * esta interfaz y registrarla; el verificador y las demás reglas no cambian (ENF-06).
 */
export interface Regla {
  readonly id: string;
  readonly tipo: TipoRegla;
  readonly descripcion: string;
  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[];
}

/** Arma un incumplimiento con el texto «regla (severidad): involucrados» (ENF-03). */
export function crearIncumplimiento(
  regla: Regla,
  sesionIds: readonly string[],
  involucrados: readonly string[],
): Incumplimiento {
  return {
    reglaId: regla.id,
    tipo: regla.tipo,
    sesionIds,
    mensaje: `${regla.id} (${NOMBRE_SEVERIDAD[regla.tipo]}): ${involucrados.join(' y ')}`,
  };
}
