import { Escenario } from '../testing/escenario';
import { Rn02BloqueSinClases } from './rn02-bloque-sin-clases';

const regla = new Rn02BloqueSinClases();
const MI = 'Modelización informacional';

describe('RN-02 Bloque sin clases', () => {
  it('no se dispara si la sesión termina justo cuando empieza el bloque (10:00–12:00)', () => {
    const escenario = new Escenario([MI]).programar(MI, 1, 'lunes', 10);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('no se dispara si la sesión empieza justo cuando termina el bloque (13:00–15:00)', () => {
    const escenario = new Escenario([MI]).programar(MI, 1, 'lunes', 13);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('se dispara si la sesión se cruza con 12:00–13:00 (11:00–13:00)', () => {
    const escenario = new Escenario([MI]).programar(MI, 1, 'miercoles', 11);
    const incumplimientos = regla.evaluar(escenario.contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].mensaje).toBe(
      'RN-02 (restricción): Modelización informacional sección 01, miércoles 11:00–13:00 se cruza con el bloque sin clases (12:00–13:00)',
    );
  });
});
