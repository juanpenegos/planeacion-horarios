import { Franja } from '../domain/models';
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
  /** Día y hora de inicio, o nulo si está pendiente. */
  readonly ubicacion: Franja | null;
  readonly estado: EstadoDeSesion;
}
