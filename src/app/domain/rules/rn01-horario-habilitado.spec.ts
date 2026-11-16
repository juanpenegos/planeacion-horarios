import { PARAMETROS_POR_DEFECTO } from '../models';
import { Escenario } from '../testing/escenario';
import { Rn01HorarioHabilitado } from './rn01-horario-habilitado';

const regla = new Rn01HorarioHabilitado();
const BD1 = 'Bases de datos 1';

describe('RN-01 Horario habilitado', () => {
  it('no se dispara si la sesión queda dentro del horario (martes 9:00–11:00)', () => {
    const escenario = new Escenario([BD1]).programar(BD1, 1, 'martes', 9);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('se dispara si la sesión termina después del cierre del sábado (12:00–14:00)', () => {
    const escenario = new Escenario([BD1]).programar(BD1, 1, 'sabado', 12);
    const incumplimientos = regla.evaluar(escenario.contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].tipo).toBe('restriccion');
    expect(incumplimientos[0].sesionIds).toEqual([escenario.sesion(BD1, 1).id]);
    expect(incumplimientos[0].mensaje).toBe(
      'RN-01 (restricción): Bases de datos 1 sección 01, sábado 12:00–14:00 fuera del horario habilitado',
    );
  });

  it('se dispara si la sesión empieza antes de la apertura (lunes 6:00)', () => {
    const escenario = new Escenario([BD1]).programar(BD1, 1, 'lunes', 6);
    expect(regla.evaluar(escenario.contexto()).length).toBe(1);
  });

  it('usa el horario de los parámetros: con sábado hasta las 11:00, 10:00–12:00 incumple', () => {
    const parametros = {
      ...PARAMETROS_POR_DEFECTO,
      horarioHabilitado: {
        ...PARAMETROS_POR_DEFECTO.horarioHabilitado,
        sabado: { inicio: 7, fin: 11 },
      },
    };
    const escenario = new Escenario([BD1], parametros).programar(BD1, 1, 'sabado', 10);
    expect(regla.evaluar(escenario.contexto()).length).toBe(1);
  });

  it('no evalúa sesiones pendientes', () => {
    expect(regla.evaluar(new Escenario([BD1]).contexto())).toEqual([]);
  });
});
