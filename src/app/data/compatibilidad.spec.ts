import { PARAMETROS_POR_DEFECTO } from '../domain/models';
import { ArchivoDePlaneacion } from './archivo-de-planeacion';
import {
  CLAVE_PLANEACION,
  LocalStoragePlaneacionRepository,
} from './local-storage-planeacion.repository';

/**
 * Planeación guardada antes de agregar el cupo y la tolerancia: sus parámetros no traen
 * esos campos. Tiene el sábado cambiado a 7:00–11:00 para comprobar que no se pierde.
 */
const PLANEACION_VIEJA = JSON.stringify({
  version: 1,
  parametros: {
    horarioHabilitado: {
      ...PARAMETROS_POR_DEFECTO.horarioHabilitado,
      sabado: { inicio: 7, fin: 11 },
    },
    bloqueSinClases: { inicio: 12, fin: 13 },
    duracionSesionHoras: 2,
    maximoSesionesSemana: 4,
  },
  bloques: [{ id: 'IV-01', semestre: 'IV', numero: '01' }],
  secciones: [],
  sesiones: [],
  bloquesMarcados: [],
});

describe('Compatibilidad con planeaciones guardadas antes del cupo', () => {
  beforeEach(() => localStorage.clear());

  it('importa un JSON viejo y completa el cupo y la tolerancia con los valores por defecto', () => {
    const p = new ArchivoDePlaneacion().importar(PLANEACION_VIEJA);
    expect(p.parametros.cupoPorSeccion).toBe(40);
    expect(p.parametros.toleranciaCupoPorcentaje).toBe(10);
    expect(p.parametros.horarioHabilitado.sabado).toEqual({ inicio: 7, fin: 11 });
    expect(p.bloques.map((b) => b.id)).toEqual(['IV-01']);
  });

  it('carga desde localStorage una planeación vieja sin fallar y con la misma clave', () => {
    localStorage.setItem(CLAVE_PLANEACION, PLANEACION_VIEJA);
    const p = new LocalStoragePlaneacionRepository(localStorage).cargar();
    expect(p).not.toBeNull();
    expect(p!.parametros.cupoPorSeccion).toBe(40);
    expect(p!.parametros.toleranciaCupoPorcentaje).toBe(10);
    expect(p!.parametros.horarioHabilitado.sabado.fin).toBe(11);
  });

  it('conserva el cupo y la tolerancia guardados cuando sí vienen en el archivo', () => {
    const archivo = new ArchivoDePlaneacion();
    const nueva = JSON.parse(PLANEACION_VIEJA);
    nueva.parametros.cupoPorSeccion = 35;
    nueva.parametros.toleranciaCupoPorcentaje = 20;
    const p = archivo.importar(JSON.stringify(nueva));
    expect(p.parametros.cupoPorSeccion).toBe(35);
    expect(p.parametros.toleranciaCupoPorcentaje).toBe(20);
  });
});
