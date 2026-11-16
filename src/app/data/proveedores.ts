import { Provider } from '@angular/core';
import { AsignaturasRepository, JsonAsignaturasRepository } from './asignaturas.repository';
import { LocalStoragePlaneacionRepository } from './local-storage-planeacion.repository';
import { PlaneacionRepository } from './planeacion.repository';

/** Une cada interfaz de datos con su implementación. */
export function proveerDatos(): Provider[] {
  return [
    { provide: AsignaturasRepository, useClass: JsonAsignaturasRepository },
    {
      provide: PlaneacionRepository,
      useFactory: () => new LocalStoragePlaneacionRepository(localStorage),
    },
  ];
}
