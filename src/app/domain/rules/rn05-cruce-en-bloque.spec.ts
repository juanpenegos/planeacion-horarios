import { Escenario } from '../testing/escenario';
import { Rn05CruceEnBloque } from './rn05-cruce-en-bloque';

const regla = new Rn05CruceEnBloque();
const MI = 'Modelización informacional';
const ITI1 = 'Infraestructura TI 1';

describe('RN-05 Cruce dentro del bloque de semestre', () => {
  it('HU-05: se dispara con Modelización informacional (jueves 14:00) e Infraestructura TI 1 (jueves 15:00)', () => {
    const escenario = new Escenario([MI, ITI1])
      .programar(MI, 1, 'jueves', 14)
      .programar(ITI1, 1, 'jueves', 15);
    const incumplimientos = regla.evaluar(escenario.contexto());
    expect(incumplimientos.length).toBe(1);
    expect(incumplimientos[0].sesionIds).toEqual([
      escenario.sesion(MI, 1).id,
      escenario.sesion(ITI1, 1).id,
    ]);
    expect(incumplimientos[0].mensaje).toBe(
      'RN-05 (restricción): Modelización informacional sección 01, jueves 14:00–16:00 y Infraestructura TI 1 sección 01, jueves 15:00–17:00',
    );
  });

  it('no se dispara si las sesiones del bloque no se solapan (jueves 14:00 y 16:00)', () => {
    const escenario = new Escenario([MI, ITI1])
      .programar(MI, 1, 'jueves', 14)
      .programar(ITI1, 1, 'jueves', 16);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('no se dispara entre asignaturas de bloques distintos (Semestre IV y Semestre VI)', () => {
    const escenario = new Escenario([MI, 'Complejidad algorítmica'])
      .programar(MI, 1, 'jueves', 14)
      .programar('Complejidad algorítmica', 1, 'jueves', 15);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });

  it('no se dispara con secciones fuera de bloque (Trabajo de grado)', () => {
    const escenario = new Escenario([MI, 'Trabajo de grado'])
      .programar(MI, 1, 'jueves', 14)
      .programar('Trabajo de grado', 1, 'jueves', 15);
    expect(regla.evaluar(escenario.contexto())).toEqual([]);
  });
});
