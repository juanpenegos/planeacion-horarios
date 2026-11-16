import { Rn01HorarioHabilitado } from './rn01-horario-habilitado';
import { RegistroDeReglas, crearRegistroDelDominio } from './registro-de-reglas';

describe('RegistroDeReglas', () => {
  it('el registro del dominio contiene las reglas con id y tipo', () => {
    const reglas = crearRegistroDelDominio().todas();
    expect(reglas.map((r) => r.id)).toContain('RN-01');
    expect(reglas.map((r) => r.id)).toContain('RN-02');
  });

  it('no permite registrar dos veces la misma regla', () => {
    const registro = new RegistroDeReglas().registrar(new Rn01HorarioHabilitado());
    expect(() => registro.registrar(new Rn01HorarioHabilitado())).toThrow();
  });
});
