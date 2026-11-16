import datos from '../../../assets/data/asignaturas.json';
import {
  Asignatura,
  PARAMETROS_POR_DEFECTO,
  SEMESTRES_CON_BLOQUE,
  Seccion,
  crearBloque,
  estaPendiente,
} from '../models';
import { GeneradorDeSesiones } from './generador-de-sesiones';
import { PlanDeEstudios } from './plan-de-estudios';

const plan = new PlanDeEstudios(datos as Asignatura[]);
const generador = new GeneradorDeSesiones();

function seccion01(asignatura: Asignatura): Seccion {
  const bloque = crearBloque(asignatura.semestre, '01');
  return {
    id: `${asignatura.id}-01`,
    asignaturaId: asignatura.id,
    numero: '01',
    bloqueId: bloque.id,
  };
}

function sesionesDe(asignaturas: Asignatura[]) {
  return asignaturas.flatMap((a) => generador.generar(seccion01(a), a, PARAMETROS_POR_DEFECTO));
}

function buscarPorNombre(nombre: string): Asignatura {
  const asignatura = plan.todas().find((a) => a.nombre === nombre);
  if (!asignatura) throw new Error(`No existe la asignatura ${nombre}`);
  return asignatura;
}

describe('GeneradorDeSesiones', () => {
  it('Bases de datos 1 (6 h) genera 3 sesiones pendientes numeradas 1 a 3', () => {
    const bd1 = buscarPorNombre('Bases de datos 1');
    expect(bd1.horasDirectasSemana).toBe(6);
    const sesiones = generador.generar(seccion01(bd1), bd1, PARAMETROS_POR_DEFECTO);
    expect(sesiones.map((s) => s.numero)).toEqual([1, 2, 3]);
    expect(sesiones.every(estaPendiente)).toBe(true);
    expect(new Set(sesiones.map((s) => s.id)).size).toBe(3);
  });

  it('con una sección por asignatura en bloque se generan 57 sesiones', () => {
    expect(sesionesDe(plan.enBloque()).length).toBe(57);
  });

  it('cada bloque tiene las asignaturas y sesiones de las cifras de control', () => {
    const esperado: Record<string, [number, number]> = {
      I: [2, 5],
      II: [1, 3],
      III: [2, 5],
      IV: [5, 10],
      V: [4, 8],
      VI: [6, 10],
      VII: [6, 10],
      VIII: [3, 6],
    };
    for (const semestre of SEMESTRES_CON_BLOQUE) {
      const asignaturas = plan.enBloque(semestre);
      expect([asignaturas.length, sesionesDe(asignaturas).length]).toEqual(esperado[semestre]);
    }
  });

  it('la cantidad de sesiones depende de la duración configurada', () => {
    const bd1 = buscarPorNombre('Bases de datos 1');
    const parametros = { ...PARAMETROS_POR_DEFECTO, duracionSesionHoras: 3 };
    expect(generador.cantidadDeSesiones(bd1, parametros)).toBe(2);
  });
});
