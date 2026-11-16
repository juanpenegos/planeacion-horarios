import { PARAMETROS_POR_DEFECTO } from '../models';
import { cabeEnHorario, horasDeLaCuadricula, iniciosPermitidos, tipoDeFranja } from './franjas';

const sabadoHastaLas11 = {
  ...PARAMETROS_POR_DEFECTO,
  horarioHabilitado: {
    ...PARAMETROS_POR_DEFECTO.horarioHabilitado,
    sabado: { inicio: 7, fin: 11 },
  },
};

describe('Franjas de la cuadrícula', () => {
  it('la cuadrícula va de 7:00 a 22:00 en franjas de una hora', () => {
    const horas = horasDeLaCuadricula(PARAMETROS_POR_DEFECTO);
    expect(horas[0]).toBe(7);
    expect(horas.at(-1)).toBe(21);
    expect(horas.length).toBe(15);
  });

  it('de lunes a viernes una sesión de 2 h puede empezar entre 7:00 y 20:00', () => {
    const inicios = iniciosPermitidos(PARAMETROS_POR_DEFECTO, 'martes');
    expect(inicios[0]).toBe(7);
    expect(inicios.at(-1)).toBe(20);
  });

  it('HU-02: con el sábado de 7:00 a 11:00 no se puede programar después de las 11:00', () => {
    expect(iniciosPermitidos(sabadoHastaLas11, 'sabado')).toEqual([7, 8, 9]);
    expect(cabeEnHorario(sabadoHastaLas11, { dia: 'sabado', horaInicio: 9 })).toBe(true);
    expect(cabeEnHorario(sabadoHastaLas11, { dia: 'sabado', horaInicio: 10 })).toBe(false);
    expect(cabeEnHorario(sabadoHastaLas11, { dia: 'sabado', horaInicio: 11 })).toBe(false);
    expect(tipoDeFranja(sabadoHastaLas11, 'sabado', 11)).toBe('fuera-de-horario');
  });

  it('sombrea el bloque sin clases de 12:00 a 13:00', () => {
    expect(tipoDeFranja(PARAMETROS_POR_DEFECTO, 'lunes', 12)).toBe('sin-clases');
    expect(tipoDeFranja(PARAMETROS_POR_DEFECTO, 'lunes', 11)).toBe('habilitada');
    expect(tipoDeFranja(PARAMETROS_POR_DEFECTO, 'lunes', 13)).toBe('habilitada');
  });
});
