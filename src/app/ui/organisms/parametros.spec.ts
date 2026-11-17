import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PARAMETROS_POR_DEFECTO, Parametros } from '../../domain/models';
import { FormularioParametros } from './formulario-parametros/formulario-parametros';
import { PanelParametros } from './panel-parametros/panel-parametros';

function montarFormulario(parametros: Parametros = PARAMETROS_POR_DEFECTO) {
  const fixture = TestBed.createComponent(FormularioParametros);
  fixture.componentRef.setInput('parametros', parametros);
  const guardados: Parametros[] = [];
  fixture.componentInstance.guardar.subscribe((p) => guardados.push(p));
  fixture.detectChanges();
  const html = fixture.nativeElement as HTMLElement;
  const campo = (nombre: string) =>
    html.querySelector(`[data-campo="${nombre}"]`) as HTMLInputElement;
  const escribir = (nombre: string, valor: string) => {
    campo(nombre).value = valor;
    campo(nombre).dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const boton = (texto: string) =>
    Array.from(html.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(texto),
    ) as HTMLButtonElement;
  return { fixture, html, campo, escribir, boton, guardados };
}

describe('Cupo de referencia en el formulario y el panel de parámetros', () => {
  it('el formulario muestra el grupo «Cupo de referencia» con 40, 10 y el cupo máximo de 44', () => {
    const { html, campo } = montarFormulario();
    const grupo = Array.from(html.querySelectorAll('fieldset')).find(
      (f) => f.querySelector('legend')?.textContent === 'Cupo de referencia',
    )!;
    expect(grupo).toBeDefined();
    expect(campo('cupo').value).toBe('40');
    expect(campo('tolerancia').value).toBe('10');
    // Cada campo tiene su etiqueta asociada.
    expect(campo('cupo').closest('label')?.textContent).toContain('Cupo por sección');
    expect(campo('tolerancia').closest('label')?.textContent).toContain('Tolerancia del cupo');
    const resultado = html.querySelector('[data-campo="cupo-maximo"]')!;
    expect(resultado.querySelector('[aria-hidden]')?.textContent).toBe(
      'Cupo máximo por sección: 44 estudiantes (40 + 10 %)',
    );
    expect(resultado.querySelector('.solo-lectores')?.textContent?.replace(/\s+/g, ' ')).toBe(
      'Cupo máximo por sección: 44 estudiantes, que resultan de 40 estudiantes más 10 por ciento de tolerancia',
    );
  });

  it('al cambiar el cupo a 35 y la tolerancia a 20 recalcula 42 y los guarda', () => {
    const { html, escribir, boton, guardados } = montarFormulario();
    escribir('cupo', '35');
    escribir('tolerancia', '20');
    expect(html.querySelector('[data-campo="cupo-maximo"] [aria-hidden]')?.textContent).toBe(
      'Cupo máximo por sección: 42 estudiantes (35 + 20 %)',
    );
    boton('Guardar').click();
    expect(guardados.length).toBe(1);
    expect(guardados[0].cupoPorSeccion).toBe(35);
    expect(guardados[0].toleranciaCupoPorcentaje).toBe(20);
  });

  it('con un cupo inválido muestra el error, oculta el cálculo y no deja guardar', () => {
    const { html, escribir, boton } = montarFormulario();
    escribir('cupo', '0');
    expect(html.querySelector('[role="alert"]')?.textContent).toContain(
      'El cupo por sección debe ser un número entero de estudiantes, mínimo 1',
    );
    expect(html.querySelector('[data-campo="cupo-maximo"]')).toBeNull();
    expect(boton('Guardar').disabled).toBe(true);
  });

  it('«Restablecer valores por defecto» devuelve el cupo a 40 y la tolerancia a 10', () => {
    const { campo, boton, fixture } = montarFormulario({
      ...PARAMETROS_POR_DEFECTO,
      cupoPorSeccion: 35,
      toleranciaCupoPorcentaje: 20,
    });
    expect(campo('cupo').value).toBe('35');
    boton('Restablecer valores por defecto').click();
    fixture.detectChanges();
    expect(campo('cupo').value).toBe('40');
    expect(campo('tolerancia').value).toBe('10');
    expect(fixture.componentInstance.borrador().cupoPorSeccion).toBe(40);
    expect(fixture.componentInstance.borrador().toleranciaCupoPorcentaje).toBe(10);
  });

  it('el panel de parámetros muestra las filas «Cupo por sección» y «Tolerancia del cupo»', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PanelParametros);
    fixture.componentRef.setInput('parametros', {
      ...PARAMETROS_POR_DEFECTO,
      cupoPorSeccion: 35,
      toleranciaCupoPorcentaje: 20,
    });
    fixture.detectChanges();
    const filas = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.fila'),
      (f) => [f.querySelector('dt')?.textContent, f.querySelector('dd')?.textContent],
    );
    expect(filas).toContainEqual(['Cupo por sección', '35 estudiantes']);
    expect(filas).toContainEqual(['Tolerancia del cupo', '20 %']);
  });
});
