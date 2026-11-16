import { Incumplimiento, Sesion, estaPendiente } from '../models';

/** Estado con que se muestra cada sesión en la cuadrícula. */
export type EstadoDeSesion = 'pendiente' | 'correcta' | 'restriccion' | 'advertencia';

/** Cifras de verificación de un bloque de semestre. */
export interface Resumen {
  readonly restricciones: number;
  readonly advertencias: number;
  readonly pendientes: number;
  /** Solo con 0 restricciones y 0 sesiones pendientes; las advertencias no lo impiden. */
  readonly listoParaPublicar: boolean;
}

/** Resume el resultado de la verificación de un bloque. */
export class ResumenDeBloque {
  resumir(sesiones: readonly Sesion[], incumplimientos: readonly Incumplimiento[]): Resumen {
    const restricciones = incumplimientos.filter((i) => i.tipo === 'restriccion').length;
    const advertencias = incumplimientos.length - restricciones;
    const pendientes = sesiones.filter(estaPendiente).length;
    return {
      restricciones,
      advertencias,
      pendientes,
      listoParaPublicar: sesiones.length > 0 && restricciones === 0 && pendientes === 0,
    };
  }

  /** «2 restricciones incumplidas · 1 advertencia · 3 sesiones pendientes». */
  texto(resumen: Resumen): string {
    const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
    return [
      plural(resumen.restricciones, 'restricción incumplida', 'restricciones incumplidas'),
      plural(resumen.advertencias, 'advertencia', 'advertencias'),
      plural(resumen.pendientes, 'sesión pendiente', 'sesiones pendientes'),
    ].join(' · ');
  }

  /** La restricción pesa más que la advertencia al decidir el color de la sesión. */
  estadoDeSesion(sesion: Sesion, incumplimientos: readonly Incumplimiento[]): EstadoDeSesion {
    if (estaPendiente(sesion)) return 'pendiente';
    const propios = incumplimientos.filter((i) => i.sesionIds.includes(sesion.id));
    if (propios.some((i) => i.tipo === 'restriccion')) return 'restriccion';
    if (propios.length > 0) return 'advertencia';
    return 'correcta';
  }
}
