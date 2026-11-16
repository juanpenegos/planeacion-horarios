import { EstadoDeSesion } from '../domain/services/resumen-de-bloque';

/** Datos de una sesión ya preparados para mostrarse en la interfaz. */
export interface VistaDeSesion {
  readonly id: string;
  readonly asignatura: string;
  readonly seccion: string;
  readonly numero: number;
  readonly total: number;
  /** «martes 9:00–11:00», o nulo si está pendiente. */
  readonly franja: string | null;
  readonly estado: EstadoDeSesion;
}

/** Texto y símbolo de cada estado, para que el color no sea el único indicador. */
export const TEXTO_ESTADO: Readonly<Record<EstadoDeSesion, { simbolo: string; texto: string }>> = {
  pendiente: { simbolo: '○', texto: 'Pendiente' },
  correcta: { simbolo: '✔', texto: 'Correcta' },
  restriccion: { simbolo: '✖', texto: 'Restricción incumplida' },
  advertencia: { simbolo: '⚠', texto: 'Advertencia' },
};
