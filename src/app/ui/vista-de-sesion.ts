import { EstadoDeSesion } from '../domain/services/resumen-de-bloque';

export type { VistaDeSesion } from '../state/vista-de-sesion';

/** Texto y símbolo de cada estado, para que el color no sea el único indicador. */
export const TEXTO_ESTADO: Readonly<Record<EstadoDeSesion, { simbolo: string; texto: string }>> = {
  pendiente: { simbolo: '○', texto: 'Pendiente' },
  correcta: { simbolo: '✔', texto: 'Correcta' },
  restriccion: { simbolo: '✖', texto: 'Restricción incumplida' },
  advertencia: { simbolo: '⚠', texto: 'Advertencia' },
};
