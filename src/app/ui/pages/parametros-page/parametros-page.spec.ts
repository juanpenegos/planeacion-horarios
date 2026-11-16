import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { proveerDatos } from '../../../data/proveedores';
import { tipoDeFranja } from '../../../domain/services/franjas';
import { asignaturaPorNombre } from '../../../domain/testing/escenario';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { PlaneacionPage } from '../planeacion-page/planeacion-page';
import { ParametrosPage } from './parametros-page';

function montar() {
  localStorage.clear();
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...proveerDatos()] });
  const store = TestBed.inject(PlaneacionStore);
  const fixture = TestBed.createComponent(ParametrosPage);
  fixture.detectChanges();
  const html = fixture.nativeElement as HTMLElement;
  const escribir = (campo: string, valor: string) => {
    const input = html.querySelector(`[data-campo="${campo}"]`) as HTMLInputElement;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const guardar = () => {
    (html.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
  };
  return { fixture, store, html, escribir, guardar };
}

describe('ParametrosPage (HU-02)', () => {
  it('HU-02: al cambiar el sábado a 7:00–11:00 y guardar, la cuadrícula deja de permitir el sábado después de las 11:00', () => {
    const { store, html, escribir, guardar } = montar();
    escribir('sabado-fin', '11');
    guardar();

    expect(html.textContent).toContain('Parámetros guardados');
    expect(store.parametros().horarioHabilitado.sabado).toEqual({ inicio: 7, fin: 11 });
    expect(store.inicios().sabado).toEqual([7, 8, 9]);
    expect(tipoDeFranja(store.parametros(), 'sabado', 11)).toBe('fuera-de-horario');

    // En la cuadrícula ya no se puede soltar el sábado a las 10:00 (terminaría a las 12:00).
    const planeacion = TestBed.createComponent(PlaneacionPage);
    planeacion.detectChanges();
    const celda = planeacion.nativeElement.querySelector('[data-franja="sabado-11"]');
    expect(celda.classList).toContain('fuera-de-horario');
    store.crearBloque('IV');
    store.crearSeccion(asignaturaPorNombre('Bases de datos 1').id, 'IV-01');
    expect(store.programar(store.pendientes()[0].id, { dia: 'sabado', horaInicio: 10 })).toBe(
      false,
    );
    expect(store.programar(store.pendientes()[0].id, { dia: 'sabado', horaInicio: 9 })).toBe(true);
  });

  it('los parámetros guardados se conservan al abrir de nuevo (ENF-01, ENF-05)', () => {
    const { escribir, guardar } = montar();
    escribir('duracion', '3');
    guardar();
    TestBed.tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: proveerDatos() });
    expect(TestBed.inject(PlaneacionStore).parametros().duracionSesionHoras).toBe(3);
  });

  it('no deja guardar parámetros inválidos y muestra el motivo', () => {
    const { html, escribir, store } = montar();
    escribir('sabado-inicio', '14');
    expect(html.querySelector('[role="alert"]')?.textContent).toContain(
      'Sábado: la hora de inicio debe ser menor que la de fin',
    );
    expect((html.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
    expect(store.parametros().horarioHabilitado.sabado.inicio).toBe(7);
  });

  it('restablece los valores por defecto', () => {
    const { html, escribir, guardar, fixture, store } = montar();
    escribir('maximo', '2');
    guardar();
    (
      Array.from(html.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Restablecer'),
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    guardar();
    expect(store.parametros().maximoSesionesSemana).toBe(4);
  });
});
