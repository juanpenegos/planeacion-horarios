import { TestBed } from '@angular/core/testing';
import { proveerDatos } from '../../../data/proveedores';
import { asignaturaPorNombre } from '../../../domain/testing/escenario';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { SeccionesPage } from './secciones-page';

function montar() {
  localStorage.clear();
  TestBed.configureTestingModule({ providers: proveerDatos() });
  const store = TestBed.inject(PlaneacionStore);
  const fixture = TestBed.createComponent(SeccionesPage);
  fixture.detectChanges();
  const html = fixture.nativeElement as HTMLElement;
  const boton = (raiz: Element, texto: string) =>
    Array.from(raiz.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(texto),
    ) as HTMLButtonElement;
  return { fixture, store, html, boton };
}

function crearBloqueIV(ctx: ReturnType<typeof montar>) {
  const select = ctx.html.querySelector('.nuevo-bloque select') as HTMLSelectElement;
  select.value = 'IV';
  ctx.boton(ctx.html.querySelector('.nuevo-bloque')!, 'Crear bloque').click();
  ctx.fixture.detectChanges();
  return ctx.html.querySelector('[data-grupo="IV-01"]')!;
}

describe('SeccionesPage (HU-03)', () => {
  it('crea el bloque «Semestre IV – sección 01» y lo deja seleccionado para planear', () => {
    const ctx = montar();
    const bloque = crearBloqueIV(ctx);
    expect(bloque.textContent).toContain('Semestre IV – sección 01');
    expect(ctx.store.grupoSeleccionado()).toBe('IV-01');
  });

  it('HU-03: al crear Bases de datos 1 sección 01 en el bloque IV aparecen 3 sesiones pendientes', () => {
    const ctx = montar();
    const bloque = crearBloqueIV(ctx);
    const select = bloque.querySelector('select') as HTMLSelectElement;
    select.value = asignaturaPorNombre('Bases de datos 1').id;
    ctx.boton(bloque, 'Crear sección').click();
    ctx.fixture.detectChanges();

    const fila = bloque.querySelector('tbody tr')!;
    const celdas = Array.from(fila.querySelectorAll('td')).map((td) => td.textContent?.trim());
    expect(celdas.slice(0, 4)).toEqual(['Bases de datos 1', '01', '6', '3']);
    expect(ctx.store.pendientes().length).toBe(3);
    expect(ctx.store.pendientes().every((v) => v.asignatura === 'Bases de datos 1')).toBe(true);
  });

  it('HU-03: solo ofrece asignaturas programables del semestre del bloque', () => {
    const ctx = montar();
    const bloque = crearBloqueIV(ctx);
    const opciones = Array.from((bloque.querySelector('select') as HTMLSelectElement).options).map(
      (o) => o.textContent,
    );
    expect(opciones.length).toBe(5);
    expect(opciones.join()).not.toContain('Matemáticas');
    const fuera = ctx.html.querySelector(
      '[data-grupo="fuera-de-bloque"] select',
    ) as HTMLSelectElement;
    expect(fuera.options.length).toBe(4);
  });

  it('HU-03: si se intenta crear una sección no programable, se muestra el motivo', () => {
    const ctx = montar();
    crearBloqueIV(ctx);
    ctx.fixture.componentInstance.crearSeccion(asignaturaPorNombre('Matemáticas 1').id, 'IV-01');
    ctx.fixture.detectChanges();
    expect(ctx.html.querySelector('[role="alert"]')?.textContent).toContain(
      'Solo se pueden crear secciones de asignaturas programables',
    );
  });

  it('crea una sección de cada asignatura del bloque IV (10 sesiones) y permite eliminar una', () => {
    const ctx = montar();
    const bloque = crearBloqueIV(ctx);
    ctx.boton(bloque, 'Crear una sección de cada asignatura').click();
    ctx.fixture.detectChanges();
    expect(bloque.querySelectorAll('tbody tr').length).toBe(5);
    expect(ctx.store.pendientes().length).toBe(10);

    ctx.boton(bloque.querySelector('tbody tr')!, 'Eliminar').click();
    ctx.fixture.detectChanges();
    expect(bloque.querySelectorAll('tbody tr').length).toBe(4);
  });
});
