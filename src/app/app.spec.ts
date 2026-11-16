import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { proveerDatos } from './data/proveedores';

describe('App', () => {
  beforeEach(async () => {
    // Cada prueba parte de una planeación vacía, sin datos de otras pruebas.
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), ...proveerDatos()],
    }).compileComponents();
  });

  it('muestra el título, el subtítulo y la navegación a las cuatro páginas', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('h1')?.textContent).toBe('Planeación de horarios de secciones');
    expect(html.textContent).toContain(
      'Programa de Ingeniería de Sistemas · Datos reales: plan de estudios PEP 2025',
    );
    const enlaces = Array.from(html.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(enlaces).toEqual(['Planeación', 'Plan de estudios', 'Secciones', 'Parámetros']);
  });

  it('la ruta inicial lleva a Planeación con sus tres columnas', async () => {
    const harness = await RouterTestingHarness.create('/');
    const html = harness.routeNativeElement as HTMLElement;
    const titulos = Array.from(html.querySelectorAll('.panel-titulo')).map((t) => t.textContent);
    expect(titulos).toEqual([
      'Bloque de semestre',
      'Sesiones pendientes (0)',
      'Horario semanal',
      'Verificación',
      'Parámetros',
    ]);
    expect(html.querySelector('aside.izquierda')).not.toBeNull();
    expect(html.querySelector('section.centro')).not.toBeNull();
    expect(html.querySelector('aside.derecha')).not.toBeNull();
  });
});
