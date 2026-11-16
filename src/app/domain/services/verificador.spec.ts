import { DIAS } from '../models';
import { crearRegistroDelDominio } from '../rules/registro-de-reglas';
import { BLOQUE_IV, Escenario, bloqueIVCompleto } from '../testing/escenario';
import { ResumenDeBloque } from './resumen-de-bloque';
import { Verificador } from './verificador';

const verificador = new Verificador(crearRegistroDelDominio());
const resumen = new ResumenDeBloque();

describe('Verificador y ResumenDeBloque', () => {
  it('el bloque IV sin programar tiene 10 sesiones pendientes y no está listo', () => {
    const escenario = new Escenario(BLOQUE_IV);
    const r = resumen.resumir(
      escenario.todasLasSesiones(),
      verificador.verificar(escenario.contexto()),
    );
    expect(r).toEqual({
      restricciones: 0,
      advertencias: 0,
      pendientes: 10,
      listoParaPublicar: false,
    });
    expect(resumen.texto(r)).toBe(
      '0 restricciones incumplidas · 0 advertencias · 10 sesiones pendientes',
    );
  });

  it('el bloque IV completo y sin cruces queda listo para publicar', () => {
    const escenario = bloqueIVCompleto();
    const incumplimientos = verificador.verificar(escenario.contexto());
    expect(incumplimientos).toEqual([]);
    expect(resumen.resumir(escenario.todasLasSesiones(), incumplimientos).listoParaPublicar).toBe(
      true,
    );
  });

  it('HU-05: con el cruce de RN-05 el bloque no se puede marcar como listo', () => {
    const escenario = bloqueIVCompleto()
      .programar('Modelización informacional', 1, 'jueves', 14)
      .programar('Infraestructura TI 1', 1, 'jueves', 15);
    const incumplimientos = verificador.verificar(escenario.contexto());
    const r = resumen.resumir(escenario.todasLasSesiones(), incumplimientos);
    expect(incumplimientos.map((i) => i.reglaId)).toContain('RN-05');
    expect(r.restricciones).toBeGreaterThan(0);
    expect(r.listoParaPublicar).toBe(false);
    const mi = escenario.sesion('Modelización informacional', 1);
    expect(resumen.estadoDeSesion(mi, incumplimientos)).toBe('restriccion');
  });

  it('las advertencias no impiden marcar el bloque como listo', () => {
    const escenario = bloqueIVCompleto().programar('Modelización informacional', 2, 'martes', 14);
    const incumplimientos = verificador.verificar(escenario.contexto());
    const r = resumen.resumir(escenario.todasLasSesiones(), incumplimientos);
    expect(r).toEqual({
      restricciones: 0,
      advertencias: 1,
      pendientes: 0,
      listoParaPublicar: true,
    });
    expect(resumen.texto(r)).toBe(
      '0 restricciones incumplidas · 1 advertencia · 0 sesiones pendientes',
    );
    const mi2 = escenario.sesion('Modelización informacional', 2);
    expect(resumen.estadoDeSesion(mi2, incumplimientos)).toBe('advertencia');
  });

  it('el estado de cada sesión distingue pendiente y correcta', () => {
    const escenario = new Escenario(BLOQUE_IV).programar('Bases de datos 1', 1, 'lunes', 7);
    const incumplimientos = verificador.verificar(escenario.contexto());
    expect(resumen.estadoDeSesion(escenario.sesion('Bases de datos 1', 1), incumplimientos)).toBe(
      'correcta',
    );
    expect(resumen.estadoDeSesion(escenario.sesion('Bases de datos 1', 2), incumplimientos)).toBe(
      'pendiente',
    );
  });

  it('ENF-02: cada verificación tras 10 movimientos en el bloque IV tarda 1 s o menos', () => {
    const escenario = bloqueIVCompleto();
    const tiempos: number[] = [];
    for (let i = 0; i < 10; i++) {
      escenario.programar('Bases de datos 1', 1, DIAS[i % DIAS.length], 7 + i);
      const inicio = performance.now();
      verificador.verificar(escenario.contexto());
      tiempos.push(performance.now() - inicio);
    }
    const maximo = Math.max(...tiempos);
    console.info(`ENF-02: verificación más lenta en 10 movimientos = ${maximo.toFixed(2)} ms`);
    expect(tiempos.length).toBe(10);
    expect(maximo).toBeLessThanOrEqual(1000);
  });
});
