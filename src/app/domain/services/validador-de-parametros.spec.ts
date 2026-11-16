import { PARAMETROS_POR_DEFECTO } from '../models';
import { ValidadorDeParametros } from './validador-de-parametros';

const validador = new ValidadorDeParametros();

describe('ValidadorDeParametros', () => {
  it('los parámetros por defecto son válidos', () => {
    expect(validador.errores(PARAMETROS_POR_DEFECTO)).toEqual([]);
  });

  it('rechaza un día que termina antes de empezar', () => {
    const p = {
      ...PARAMETROS_POR_DEFECTO,
      horarioHabilitado: {
        ...PARAMETROS_POR_DEFECTO.horarioHabilitado,
        sabado: { inicio: 11, fin: 7 },
      },
    };
    expect(validador.errores(p)).toEqual([
      'Sábado: la hora de inicio debe ser menor que la de fin, entre 0 y 24',
    ]);
  });

  it('rechaza una duración de 0 horas y un máximo de 0 sesiones', () => {
    const p = { ...PARAMETROS_POR_DEFECTO, duracionSesionHoras: 0, maximoSesionesSemana: 0 };
    expect(validador.errores(p).length).toBe(2);
  });
});
