import { Escenario } from '../testing/escenario';
import { Rn04CruceEnSeccion } from './rn04-cruce-en-seccion';

const regla = new Rn04CruceEnSeccion();
const BD1 = 'Bases de datos 1';

describe('RN-04 Cruce dentro de la sección', () => {
  it('no se dispara si las sesiones de la sección quedan en días distintos', () => {
    const escenario = new Escenario([BD1])
      .programar(BD1, 1, 'lunes', 9)
      .programar(BD1, 2, 'miercoles', 9)
      .programar(BD1, 3, 'viernes', 9);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('no se dispara si una sesión empieza cuando termina la otra (9:00 y 11:00)', () => {
    const escenario = new Escenario([BD1])
      .programar(BD1, 1, 'lunes', 9)
      .programar(BD1, 2, 'lunes', 11);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('se dispara si dos sesiones de la sección se solapan (lunes 9:00 y 10:00)', () => {
    const escenario = new Escenario([BD1])
      .programar(BD1, 1, 'lunes', 9)
      .programar(BD1, 2, 'lunes', 10);
    const incumplimientos = regla.evaluar(escenario.contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].mensaje).toBe(
      'RN-04 (restricción): Bases de datos 1 sección 01, lunes 9:00–11:00 (sesión 1) y Bases de datos 1 sección 01, lunes 10:00–12:00 (sesión 2)',
    );
  });
});
