import { TestBed } from '@angular/core/testing';
import { CLAVE_PLANEACION } from '../data/local-storage-planeacion.repository';
import { proveerDatos } from '../data/proveedores';
import { BLOQUE_IV, asignaturaPorNombre } from '../domain/testing/escenario';
import { Incumplimiento } from '../domain/models';
import { ExportacionDePlaneacion } from './exportacion-de-planeacion';
import { PlaneacionStore } from './planeacion.store';
import { VERIFICADOR } from './servicios-del-dominio';

function crearStore(): PlaneacionStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: proveerDatos() });
  return TestBed.inject(PlaneacionStore);
}

function id(nombre: string): string {
  return asignaturaPorNombre(nombre).id;
}

describe('PlaneacionStore', () => {
  beforeEach(() => localStorage.clear());

  it('arranca vacío con los parámetros por defecto', () => {
    const store = crearStore();
    expect(store.planeacion().secciones).toEqual([]);
    expect(store.parametros().duracionSesionHoras).toBe(2);
  });

  it('verifica el bloque seleccionado al programar (HU-05) y lo resume', () => {
    const store = crearStore();
    store.crearBloque('IV');
    store.grupoSeleccionado.set('IV-01');
    store.crearSeccion(id('Modelización informacional'), 'IV-01');
    store.crearSeccion(id('Infraestructura TI 1'), 'IV-01');
    expect(store.textoResumen()).toBe(
      '0 restricciones incumplidas · 0 advertencias · 4 sesiones pendientes',
    );
    store.programar(`${id('Modelización informacional')}-01-s1`, { dia: 'jueves', horaInicio: 14 });
    store.programar(`${id('Infraestructura TI 1')}-01-s1`, { dia: 'jueves', horaInicio: 15 });
    expect(store.incumplimientos().map((i) => i.reglaId)).toEqual(['RN-05']);
    expect(store.resumen().listoParaPublicar).toBe(false);
    expect(() => store.marcarComoListo()).toThrow();
  });

  it('ENF-05: al crear el almacén de nuevo, la planeación sigue ahí', () => {
    const store = crearStore();
    store.crearBloque('IV');
    store.crearSeccion(id('Bases de datos 1'), 'IV-01');
    store.programar(`${id('Bases de datos 1')}-01-s1`, { dia: 'martes', horaInicio: 9 });
    TestBed.tick();
    expect(localStorage.getItem(CLAVE_PLANEACION)).not.toBeNull();

    const reabierto = crearStore();
    expect(reabierto.planeacion().sesiones[0].franja).toEqual({ dia: 'martes', horaInicio: 9 });
    expect(reabierto.grupoSeleccionado()).toBe('IV-01');
  });

  it('exporta e importa la planeación como JSON con su servicio propio', () => {
    const store = crearStore();
    store.crearBloque('IV');
    for (const nombre of BLOQUE_IV) store.crearSeccion(id(nombre), 'IV-01');
    const json = TestBed.inject(ExportacionDePlaneacion).json().contenido;

    const otro = crearStore();
    TestBed.inject(ExportacionDePlaneacion).importarJson(json);
    expect(otro.planeacion().sesiones.length).toBe(10);
    expect(otro.grupoSeleccionado()).toBe('IV-01');
  });

  it('recibe el verificador por inyección: se puede reemplazar sin tocar el almacén', () => {
    const aviso: Incumplimiento = {
      reglaId: 'PRUEBA',
      tipo: 'advertencia',
      sesionIds: [],
      mensaje: 'Regla de prueba',
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ...proveerDatos(),
        { provide: VERIFICADOR, useValue: { verificar: () => [aviso] } },
      ],
    });
    const store = TestBed.inject(PlaneacionStore);
    expect(store.incumplimientos()).toEqual([aviso]);
  });
});
