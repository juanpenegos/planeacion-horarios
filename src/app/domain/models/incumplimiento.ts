/** Severidad de una regla: obligatoria (restricción) o deseable (advertencia). */
export type TipoRegla = 'restriccion' | 'advertencia';

/** Resultado de una regla que no se cumple. */
export interface Incumplimiento {
  readonly reglaId: string;
  readonly tipo: TipoRegla;
  /** Sesiones involucradas en el incumplimiento. */
  readonly sesionIds: readonly string[];
  /** Texto «regla (severidad): asignaturas, día y franja» (ENF-03). */
  readonly mensaje: string;
}
