import { Dia } from './parametros';

/** Día y hora de inicio de una sesión. */
export interface Franja {
  readonly dia: Dia;
  readonly horaInicio: number;
}

/** Encuentro semanal de una sección. Sin franja, la sesión está pendiente. */
export interface Sesion {
  readonly id: string;
  readonly seccionId: string;
  /** Posición de la sesión dentro de la sección (1, 2, 3…). */
  readonly numero: number;
  readonly franja: Franja | null;
}

export function estaPendiente(sesion: Sesion): boolean {
  return sesion.franja === null;
}
