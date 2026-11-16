import { planeacionVacia } from '../domain/models';
import { EditorDePlaneacion } from '../domain/services/editor-de-planeacion';
import { PlanDeEstudios } from '../domain/services/plan-de-estudios';
import { ASIGNATURAS, asignaturaPorNombre } from '../domain/testing/escenario';
import { ArchivoDePlaneacion } from './archivo-de-planeacion';
import {
  CLAVE_PLANEACION,
  LocalStoragePlaneacionRepository,
} from './local-storage-planeacion.repository';

const editor = new EditorDePlaneacion(new PlanDeEstudios(ASIGNATURAS));

function planeacionConBd1Programada() {
  let p = editor.crearBloque(planeacionVacia(), 'IV');
  p = editor.crearSeccion(p, asignaturaPorNombre('Bases de datos 1').id, 'IV-01');
  return editor.programar(p, p.sesiones[0].id, { dia: 'martes', horaInicio: 9 });
}

describe('LocalStoragePlaneacionRepository', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve null si no hay nada guardado', () => {
    expect(new LocalStoragePlaneacionRepository(localStorage).cargar()).toBeNull();
  });

  it('ENF-05: la sesión sigue programada al abrir de nuevo con otro repositorio', () => {
    new LocalStoragePlaneacionRepository(localStorage).guardar(planeacionConBd1Programada());
    const cargada = new LocalStoragePlaneacionRepository(localStorage).cargar();
    expect(cargada?.sesiones[0].franja).toEqual({ dia: 'martes', horaInicio: 9 });
    expect(cargada?.sesiones.length).toBe(3);
  });

  it('ignora datos dañados en el almacenamiento', () => {
    localStorage.setItem(CLAVE_PLANEACION, '{no es json');
    expect(new LocalStoragePlaneacionRepository(localStorage).cargar()).toBeNull();
  });
});

describe('ArchivoDePlaneacion', () => {
  const archivo = new ArchivoDePlaneacion();

  it('exporta e importa la planeación sin perder datos', () => {
    const p = planeacionConBd1Programada();
    expect(archivo.importar(archivo.exportar(p))).toEqual(p);
  });

  it('rechaza un archivo que no es JSON', () => {
    expect(() => archivo.importar('hola')).toThrow('El archivo no es un JSON válido');
  });

  it('rechaza un JSON que no es una planeación', () => {
    expect(() => archivo.importar('{"version": 2}')).toThrow(
      'El archivo no contiene una planeación válida',
    );
  });
});
