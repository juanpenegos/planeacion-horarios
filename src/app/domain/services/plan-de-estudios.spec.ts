import datos from '../../../assets/data/asignaturas.json';
import { Asignatura, SEMESTRES } from '../models';
import { PlanDeEstudios } from './plan-de-estudios';

const plan = new PlanDeEstudios(datos as Asignatura[]);

describe('PlanDeEstudios con los datos reales del PEP 2025', () => {
  it('tiene 58 asignaturas y 33 programables', () => {
    expect(plan.todas().length).toBe(58);
    expect(plan.programables().length).toBe(33);
  });

  it('tiene 29 asignaturas en bloque y 4 fuera de bloque', () => {
    expect(plan.enBloque().length).toBe(29);
    expect(plan.fueraDeBloque().map((a) => a.nombre)).toEqual([
      'Electiva de profundización en ingeniería de sistemas 1',
      'Electiva de profundización en ingeniería de sistemas 2',
      'Trabajo de grado',
      'Electiva de profundización en ingeniería de sistemas 3',
    ]);
  });

  it('las asignaturas de fundamentación y libre escogencia no son programables', () => {
    const noProgramables = plan
      .todas()
      .filter((a) => a.alcance === 'fundamentacion' || a.alcance === 'libre-escogencia');
    expect(noProgramables.length).toBe(25);
    expect(noProgramables.every((a) => !a.programable)).toBe(true);
  });

  it('los créditos por semestre coinciden con el PEP', () => {
    const creditos = plan.creditosPorSemestre();
    expect(SEMESTRES.map((s) => creditos.get(s))).toEqual([16, 18, 16, 18, 16, 16, 16, 16, 16]);
  });
});
