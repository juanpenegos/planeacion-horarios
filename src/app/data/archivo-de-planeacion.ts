import { ErrorDePlaneacion, PARAMETROS_POR_DEFECTO, Planeacion } from '../domain/models';

/** Convierte la planeación a texto JSON y la recupera desde un archivo (ENF-05). */
export class ArchivoDePlaneacion {
  exportar(planeacion: Planeacion): string {
    return JSON.stringify(planeacion, null, 2);
  }

  importar(texto: string): Planeacion {
    let datos: unknown;
    try {
      datos = JSON.parse(texto);
    } catch {
      throw new ErrorDePlaneacion('El archivo no es un JSON válido');
    }
    if (!esPlaneacion(datos)) {
      throw new ErrorDePlaneacion('El archivo no contiene una planeación válida');
    }
    // Compatibilidad: las planeaciones guardadas antes de agregar un parámetro no lo traen;
    // se completa con su valor por defecto en vez de rechazar el archivo.
    return {
      ...datos,
      parametros: { ...PARAMETROS_POR_DEFECTO, ...datos.parametros },
      bloquesMarcados: datos.bloquesMarcados ?? [],
    };
  }
}

function esPlaneacion(datos: unknown): datos is Planeacion {
  if (typeof datos !== 'object' || datos === null) return false;
  const p = datos as Record<string, unknown>;
  return (
    p['version'] === 1 &&
    typeof p['parametros'] === 'object' &&
    p['parametros'] !== null &&
    Array.isArray(p['bloques']) &&
    Array.isArray(p['secciones']) &&
    Array.isArray(p['sesiones'])
  );
}
