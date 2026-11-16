import { PARAMETROS_POR_DEFECTO } from '../models';
import { Escenario } from '../testing/escenario';
import { Rn03NumeroDeSesiones } from './rn03-numero-de-sesiones';

const regla = new Rn03NumeroDeSesiones();
const BD1 = 'Bases de datos 1';

describe('RN-03 Número de sesiones', () => {
  it('no se dispara si Bases de datos 1 (6 h) tiene sus 3 sesiones', () => {
    expect(regla.evaluar(new Escenario([BD1]).contexto())).toEqual([]);
  });

  it('se dispara si a la sección le falta una sesión', () => {
    const escenario = new Escenario([BD1]);
    escenario.conSesiones(escenario.todasLasSesiones().slice(0, 2));
    const incumplimientos = regla.evaluar(escenario.contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].mensaje).toBe(
      'RN-03 (restricción): Bases de datos 1 sección 01 tiene 2 sesiones y debe tener 3',
    );
  });

  it('se dispara si las sesiones necesarias superan el máximo semanal', () => {
    const parametros = { ...PARAMETROS_POR_DEFECTO, maximoSesionesSemana: 2 };
    const incumplimientos = regla.evaluar(new Escenario([BD1], parametros).contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].mensaje).toContain('requiere 3 sesiones y el máximo semanal es 2');
  });
});
