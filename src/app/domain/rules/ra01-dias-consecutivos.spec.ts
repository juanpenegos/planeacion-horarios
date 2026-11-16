import { Escenario } from '../testing/escenario';
import { Ra01DiasConsecutivos } from './ra01-dias-consecutivos';

const regla = new Ra01DiasConsecutivos();
const MI = 'Modelización informacional';
const BD1 = 'Bases de datos 1';

describe('RA-01 Días consecutivos', () => {
  it('no se dispara si las 2 sesiones quedan lunes y miércoles', () => {
    const escenario = new Escenario([MI])
      .programar(MI, 1, 'lunes', 9)
      .programar(MI, 2, 'miercoles', 9);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('se dispara como advertencia si las 2 sesiones quedan martes y miércoles', () => {
    const escenario = new Escenario([MI])
      .programar(MI, 1, 'martes', 9)
      .programar(MI, 2, 'miercoles', 14);
    const incumplimientos = regla.evaluar(escenario.contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].tipo).toBe('advertencia');
    expect(incumplimientos[0].mensaje).toBe(
      'RA-01 (advertencia): Modelización informacional sección 01, martes 9:00–11:00 y Modelización informacional sección 01, miércoles 14:00–16:00 en días consecutivos',
    );
  });

  it('se dispara con 3 sesiones si dos quedan en días seguidos (viernes y sábado)', () => {
    const escenario = new Escenario([BD1])
      .programar(BD1, 1, 'lunes', 9)
      .programar(BD1, 2, 'viernes', 9)
      .programar(BD1, 3, 'sabado', 9);
    expect(regla.evaluar(escenario.contexto()).length).toBe(1);
  });

  it('no aplica a secciones con una sola sesión (Proyecto núcleo 1)', () => {
    const escenario = new Escenario(['Proyecto núcleo 1', MI])
      .programar('Proyecto núcleo 1', 1, 'lunes', 9)
      .programar(MI, 1, 'martes', 9);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });
});
