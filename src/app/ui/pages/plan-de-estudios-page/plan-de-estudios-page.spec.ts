import { TestBed } from '@angular/core/testing';
import { proveerDatos } from '../../../data/proveedores';
import { PlanDeEstudiosPage } from './plan-de-estudios-page';

function montar() {
  localStorage.clear();
  TestBed.configureTestingModule({ providers: proveerDatos() });
  const fixture = TestBed.createComponent(PlanDeEstudiosPage);
  fixture.detectChanges();
  return { fixture, html: fixture.nativeElement as HTMLElement };
}

describe('PlanDeEstudiosPage (HU-01)', () => {
  it('HU-01: muestra 58 asignaturas y 33 programables', () => {
    const { html } = montar();
    expect(html.textContent).toContain('58 asignaturas');
    expect(html.textContent).toContain('33 programables');
    expect(html.textContent).toContain('29 en bloque · 4 fuera de bloque');
    expect(html.querySelectorAll('app-tabla-asignaturas tbody tr').length).toBe(58);
  });

  it('HU-01: los créditos por semestre coinciden con el PEP', () => {
    const { html } = montar();
    const creditos = Array.from(html.querySelectorAll('table.creditos tbody td')).map((td) =>
      Number(td.textContent),
    );
    expect(creditos).toEqual([16, 18, 16, 18, 16, 16, 16, 16, 16]);
  });

  it('muestra semestre, carácter, componente, créditos y horas directas de cada asignatura', () => {
    const { html } = montar();
    const fila = Array.from(html.querySelectorAll('app-tabla-asignaturas tbody tr')).find((tr) =>
      tr.textContent?.includes('Bases de datos 1'),
    )!;
    const celdas = Array.from(fila.querySelectorAll('td')).map((td) => td.textContent?.trim());
    expect(celdas).toEqual([
      'IV',
      'Bases de datos 1',
      'Obligatoria',
      'Bloque de semestre',
      '4',
      '6',
      '✔ Sí',
    ]);
  });

  it('el filtro «Solo programables» deja las 33 asignaturas programables', () => {
    const { fixture, html } = montar();
    const casilla = html.querySelector('input[type="checkbox"]') as HTMLInputElement;
    casilla.checked = true;
    casilla.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(html.querySelectorAll('app-tabla-asignaturas tbody tr').length).toBe(33);
  });
});
