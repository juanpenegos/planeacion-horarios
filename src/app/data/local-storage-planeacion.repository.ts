import { Planeacion } from '../domain/models';
import { ArchivoDePlaneacion } from './archivo-de-planeacion';
import { PlaneacionRepository } from './planeacion.repository';

export const CLAVE_PLANEACION = 'planeacion-horarios/v1';

/**
 * Guarda la planeación en el almacenamiento del navegador para que se conserve
 * al cerrarlo o apagar el equipo (ENF-05). Vive en un solo navegador.
 */
export class LocalStoragePlaneacionRepository extends PlaneacionRepository {
  private readonly archivo = new ArchivoDePlaneacion();

  constructor(private readonly almacenamiento: Storage) {
    super();
  }

  cargar(): Planeacion | null {
    const texto = this.almacenamiento.getItem(CLAVE_PLANEACION);
    if (texto === null) return null;
    try {
      return this.archivo.importar(texto);
    } catch {
      return null;
    }
  }

  guardar(planeacion: Planeacion): void {
    this.almacenamiento.setItem(CLAVE_PLANEACION, this.archivo.exportar(planeacion));
  }
}
