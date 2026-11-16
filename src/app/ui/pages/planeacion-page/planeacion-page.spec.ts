import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { proveerDatos } from '../../../data/proveedores';
import { Franja } from '../../../domain/models';
import { asignaturaPorNombre } from '../../../domain/testing/escenario';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { CuadriculaSemanal } from '../../organisms/cuadricula-semanal/cuadricula-semanal';
import { PanelPendientes } from '../../organisms/panel-pendientes/panel-pendientes';
import { PlaneacionPage } from './planeacion-page';

const BD1 = asignaturaPorNombre('Bases de datos 1').id;

function montar() {
  localStorage.clear();
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...proveerDatos()] });
  const store = TestBed.inject(PlaneacionStore);
  store.crearBloque('IV');
  store.grupoSeleccionado.set('IV-01');
  store.crearSeccion(BD1, 'IV-01');
  const fixture = TestBed.createComponent(PlaneacionPage);
  fixture.detectChanges();
  return { fixture, store, html: fixture.nativeElement as HTMLElement };
}

function soltar(
  componente: CuadriculaSemanal | PanelPendientes,
  sesionId: string,
  destino: Franja | string,
  sobreElDestino = true,
) {
  const evento = {
    item: { data: sesionId },
    container: { data: destino },
    previousContainer: {},
    isPointerOverContainer: sobreElDestino,
  } as never;
  componente.alSoltar(evento);
}

describe('PlaneacionPage (HU-04)', () => {
  it('muestra las 3 sesiones pendientes de Bases de datos 1 con «sesión 1 de 3»', () => {
    const { html } = montar();
    expect(html.textContent).toContain('Sesiones pendientes (3)');
    expect(html.textContent).toContain('Sección 01 · sesión 1 de 3');
  });

  it('HU-04: al soltar una sesión el martes a las 9:00 queda de 9:00 a 11:00 y deja de ser pendiente', () => {
    const { fixture, store, html } = montar();
    const cuadricula = fixture.debugElement.query(By.directive(CuadriculaSemanal));
    soltar(cuadricula.componentInstance, `${BD1}-01-s1`, { dia: 'martes', horaInicio: 9 });
    fixture.detectChanges();

    expect(store.programadas().map((v) => v.franja)).toEqual(['martes 9:00–11:00']);
    expect(store.pendientes().length).toBe(2);
    const celda = html.querySelector('[data-franja="martes-9"]')!;
    expect(celda.textContent).toContain('Bases de datos 1');
    expect(html.textContent).toContain('Sesiones pendientes (2)');
  });

  it('mueve una sesión entre celdas y la devuelve a pendientes', () => {
    const { fixture, store } = montar();
    const cuadricula = fixture.debugElement.query(By.directive(CuadriculaSemanal));
    const pendientes = fixture.debugElement.query(By.directive(PanelPendientes));
    const id = `${BD1}-01-s1`;
    soltar(cuadricula.componentInstance, id, { dia: 'martes', horaInicio: 9 });
    soltar(cuadricula.componentInstance, id, { dia: 'jueves', horaInicio: 14 });
    expect(store.programadas()[0].franja).toBe('jueves 14:00–16:00');
    soltar(pendientes.componentInstance, id, 'pendientes');
    expect(store.pendientes().length).toBe(3);
  });

  it('si se suelta fuera de una celda válida, la sesión no se programa', () => {
    const { fixture, store } = montar();
    const cuadricula = fixture.debugElement.query(By.directive(CuadriculaSemanal));
    soltar(cuadricula.componentInstance, `${BD1}-01-s1`, { dia: 'viernes', horaInicio: 10 }, false);
    expect(store.pendientes().length).toBe(3);
  });

  it('«Programar en…» permite programar con teclado sin arrastrar', () => {
    const { fixture, store, html } = montar();
    const primera = html.querySelector('app-panel-pendientes li')!;
    const [dia, hora] = Array.from(primera.querySelectorAll('select'));
    dia.value = 'martes';
    dia.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    hora.value = '9';
    (primera.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(store.programadas().map((v) => v.franja)).toEqual(['martes 9:00–11:00']);
  });

  it('la cuadrícula no permite soltar donde la sesión no cabe (sábado 12:00)', () => {
    const { fixture } = montar();
    const cuadricula: CuadriculaSemanal = fixture.debugElement.query(
      By.directive(CuadriculaSemanal),
    ).componentInstance;
    const celda = (franja: Franja) => ({ data: franja }) as never;
    expect(cuadricula.permitirSoltar({} as never, celda({ dia: 'sabado', horaInicio: 11 }))).toBe(
      true,
    );
    expect(cuadricula.permitirSoltar({} as never, celda({ dia: 'sabado', horaInicio: 12 }))).toBe(
      false,
    );
  });
});
