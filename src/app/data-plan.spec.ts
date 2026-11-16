import asignaturas from '../assets/data/asignaturas.json';

describe('asignaturas.json', () => {
  it('contiene 58 asignaturas y 33 programables', () => {
    expect(asignaturas.length).toBe(58);
    expect(asignaturas.filter((a) => a.programable).length).toBe(33);
  });
});
