import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { proveerDatos } from '../../../data/proveedores';
import {
  BLOQUE_IV,
  asignaturaPorNombre,
  bloqueIVCompleto,
} from '../../../domain/testing/escenario';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { PlaneacionPage } from '../../pages/planeacion-page/planeacion-page';

const id = (nombre: string) => asignaturaPorNombre(nombre).id;
const MI = 'Modelización informacional';
const ITI1 = 'Infraestructura TI 1';

function montar(nombres: readonly string[]) {
  localStorage.clear();
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...proveerDatos()] });
  const store = TestBed.inject(PlaneacionStore);
  store.crearBloque('IV');
  store.grupoSeleccionado.set('IV-01');
  for (const nombre of nombres) store.crearSeccion(id(nombre), 'IV-01');
  const fixture = TestBed.createComponent(PlaneacionPage);
  fixture.detectChanges();
  const html = fixture.nativeElement as HTMLElement;
  const boton = () =>
    Array.from(html.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Marcar como listo para publicar'),
    ) as HTMLButtonElement | undefined;
  return { fixture, store, html, boton };
}

describe('Panel de verificación (HU-05)', () => {
  it('HU-05: con el cruce del jueves muestra RN-05 con ambas asignaturas y no deja marcar como listo', () => {
    const { fixture, store, html, boton } = montar([MI, ITI1]);
    store.programar(`${id(MI)}-01-s1`, { dia: 'jueves', horaInicio: 14 });
    store.programar(`${id(ITI1)}-01-s1`, { dia: 'jueves', horaInicio: 15 });
    fixture.detectChanges();

    const avisos = Array.from(html.querySelectorAll('app-fila-aviso')).map((a) => a.textContent);
    expect(avisos.length).toBe(1);
    expect(avisos[0]).toContain('✖ Restricción');
    expect(avisos[0]).toContain(
      'RN-05 (restricción): Modelización informacional sección 01, jueves 14:00–16:00 y Infraestructura TI 1 sección 01, jueves 15:00–17:00',
    );
    expect(html.textContent).toContain(
      '1 restricción incumplida · 0 advertencias · 2 sesiones pendientes',
    );
    expect(html.textContent).toContain('No listo para publicar');
    expect(boton()?.disabled).toBe(true);

    const enRojo = html.querySelectorAll('app-tarjeta-sesion.restriccion');
    expect(enRojo.length).toBe(2);
  });

  it('el bloque IV completo queda listo y se puede marcar como listo para publicar', () => {
    const { fixture, store, html, boton } = montar(BLOQUE_IV);
    for (const sesion of bloqueIVCompleto().todasLasSesiones()) {
      store.programar(sesion.id, sesion.franja!);
    }
    fixture.detectChanges();
    expect(html.textContent).toContain(
      '0 restricciones incumplidas · 0 advertencias · 0 sesiones pendientes',
    );
    expect(html.textContent).toContain('Listo para publicar');
    expect(html.textContent).toContain('Sin restricciones ni advertencias.');

    boton()!.click();
    fixture.detectChanges();
    expect(store.marcadoComoListo()).toBe(true);
    expect(html.textContent).toContain('Bloque marcado como listo para publicar');
  });

  it('muestra los parámetros vigentes', () => {
    const { html } = montar([]);
    const parametros = html.querySelector('app-panel-parametros')!.textContent!;
    expect(parametros).toContain('Lunes a viernes');
    expect(parametros).toContain('7:00 a 22:00');
    expect(parametros).toContain('Sábado');
    expect(parametros).toContain('7:00 a 13:00');
    expect(parametros).toContain('Bloque sin clases');
    expect(parametros).toContain('12:00 a 13:00');
    expect(parametros).toContain('2 horas');
  });
});
