import { Incumplimiento } from '../models';
import { Escenario } from '../testing/escenario';
import { ContextoDeVerificacion } from './contexto-de-verificacion';
import { Regla } from './regla';
import { Rn01HorarioHabilitado } from './rn01-horario-habilitado';
import { RegistroDeReglas, crearRegistroDelDominio } from './registro-de-reglas';

/** Regla de prueba (ENF-06): advierte toda sesión programada el sábado. */
class ReglaDePruebaSinSabado implements Regla {
  readonly id = 'RP-01';
  readonly tipo = 'advertencia' as const;
  readonly descripcion = 'Regla de prueba: no programar el sábado';
  evaluar(contexto: ContextoDeVerificacion): Incumplimiento[] {
    return contexto
      .programadas()
      .filter((s) => s.franja.dia === 'sabado')
      .map((s) => ({ reglaId: this.id, tipo: this.tipo, sesionIds: [s.id], mensaje: 'sábado' }));
  }
}

describe('RegistroDeReglas', () => {
  it('el registro del dominio contiene las seis reglas con su tipo', () => {
    const reglas = crearRegistroDelDominio().todas();
    expect(reglas.map((r) => `${r.id}:${r.tipo}`)).toEqual([
      'RN-01:restriccion',
      'RN-02:restriccion',
      'RN-03:restriccion',
      'RN-04:restriccion',
      'RN-05:restriccion',
      'RA-01:advertencia',
    ]);
  });

  it('no permite registrar dos veces la misma regla', () => {
    const registro = new RegistroDeReglas().registrar(new Rn01HorarioHabilitado());
    expect(() => registro.registrar(new Rn01HorarioHabilitado())).toThrow();
  });

  it('ENF-06: se agrega una regla de prueba sin modificar las demás', () => {
    const registro = crearRegistroDelDominio().registrar(new ReglaDePruebaSinSabado());
    const contexto = new Escenario(['Bases de datos 1'])
      .programar('Bases de datos 1', 1, 'sabado', 8)
      .contexto();
    const ids = registro.todas().flatMap((r) => r.evaluar(contexto).map((i) => i.reglaId));
    expect(registro.todas().length).toBe(7);
    expect(ids).toContain('RP-01');
  });
});
