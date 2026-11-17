import { PARAMETROS_POR_DEFECTO } from '../models';
import { cupoMaximo, textoCupoMaximo } from './cupo';
import { ValidadorDeParametros } from './validador-de-parametros';

const validador = new ValidadorDeParametros();

describe('Cupo de referencia (parámetro informativo)', () => {
  it('por defecto el cupo es 40 estudiantes con una tolerancia del 10 %', () => {
    expect(PARAMETROS_POR_DEFECTO.cupoPorSeccion).toBe(40);
    expect(PARAMETROS_POR_DEFECTO.toleranciaCupoPorcentaje).toBe(10);
  });

  it('el cupo máximo es el cupo más la tolerancia: 40 + 10 % = 44', () => {
    expect(cupoMaximo(PARAMETROS_POR_DEFECTO)).toBe(44);
    expect(textoCupoMaximo(PARAMETROS_POR_DEFECTO)).toBe(
      'Cupo máximo por sección: 44 estudiantes (40 + 10 %)',
    );
  });

  it('redondea hacia abajo y no arrastra errores de decimales', () => {
    expect(cupoMaximo({ cupoPorSeccion: 35, toleranciaCupoPorcentaje: 20 })).toBe(42);
    expect(cupoMaximo({ cupoPorSeccion: 25, toleranciaCupoPorcentaje: 10 })).toBe(27); // 27,5
    expect(cupoMaximo({ cupoPorSeccion: 30, toleranciaCupoPorcentaje: 0 })).toBe(30);
    expect(cupoMaximo({ cupoPorSeccion: 30, toleranciaCupoPorcentaje: 100 })).toBe(60);
  });

  it('acepta un cupo entero positivo y una tolerancia entre 0 y 100', () => {
    for (const [cupo, tolerancia] of [
      [1, 0],
      [40, 10],
      [35, 20],
      [50, 100],
    ]) {
      const p = {
        ...PARAMETROS_POR_DEFECTO,
        cupoPorSeccion: cupo,
        toleranciaCupoPorcentaje: tolerancia,
      };
      expect(validador.errores(p)).toEqual([]);
    }
  });

  it('rechaza un cupo que no sea un entero mayor que 0', () => {
    for (const cupo of [0, -5, 40.5, Number.NaN]) {
      expect(validador.errores({ ...PARAMETROS_POR_DEFECTO, cupoPorSeccion: cupo })).toEqual([
        'El cupo por sección debe ser un número entero de estudiantes, mínimo 1',
      ]);
    }
  });

  it('rechaza una tolerancia menor que 0 o mayor que 100', () => {
    for (const tolerancia of [-1, 101, Number.NaN]) {
      const p = { ...PARAMETROS_POR_DEFECTO, toleranciaCupoPorcentaje: tolerancia };
      expect(validador.errores(p)).toEqual([
        'La tolerancia del cupo debe ser un porcentaje entre 0 y 100',
      ]);
    }
  });
});
