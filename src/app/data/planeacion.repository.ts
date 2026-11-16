import { Planeacion } from '../domain/models';

/**
 * Puerta única para guardar y cargar la planeación. El resto del sistema depende
 * de esta interfaz y no de `localStorage`, así que se podría cambiar por una API.
 */
export abstract class PlaneacionRepository {
  /** Devuelve la planeación guardada, o `null` si no hay ninguna. */
  abstract cargar(): Planeacion | null;
  abstract guardar(planeacion: Planeacion): void;
}
