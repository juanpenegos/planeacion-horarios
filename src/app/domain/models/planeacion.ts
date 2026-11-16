import { Bloque } from './bloque';
import { PARAMETROS_POR_DEFECTO, Parametros } from './parametros';
import { Seccion } from './seccion';
import { Sesion } from './sesion';

/** Todo lo que el Director ha planeado: se guarda, se exporta y se importa como una unidad. */
export interface Planeacion {
  readonly version: 1;
  readonly parametros: Parametros;
  readonly bloques: readonly Bloque[];
  readonly secciones: readonly Seccion[];
  readonly sesiones: readonly Sesion[];
  /** Bloques que el Director marcó como listos para publicar. */
  readonly bloquesMarcados: readonly string[];
}

export function planeacionVacia(): Planeacion {
  return {
    version: 1,
    parametros: PARAMETROS_POR_DEFECTO,
    bloques: [],
    secciones: [],
    sesiones: [],
    bloquesMarcados: [],
  };
}

/** Error de una operación que el Director no puede hacer, con un mensaje para mostrarle. */
export class ErrorDePlaneacion extends Error {}
