import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Boton } from './boton/boton';
import { Celda } from './celda/celda';
import { Chip } from './chip/chip';
import { EtiquetaSeveridad } from './etiqueta-severidad/etiqueta-severidad';

@Component({
  imports: [Boton],
  template: `<button app-boton variante="primario">Exportar</button
    ><button app-boton>Otro</button>`,
})
class PruebaBoton {}

describe('Átomos', () => {
  it('el botón primario lleva la clase de estilo', () => {
    const fixture = TestBed.createComponent(PruebaBoton);
    fixture.detectChanges();
    const [primario, secundario] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );
    expect(primario.classList).toContain('primario');
    expect(secundario.classList).toContain('secundario');
    expect(secundario.classList).not.toContain('primario');
  });

  it('el chip muestra asignatura y detalle', () => {
    const fixture = TestBed.createComponent(Chip);
    fixture.componentRef.setInput('titulo', 'Bases de datos 1');
    fixture.componentRef.setInput('detalle', 'Sección 01 · sesión 1 de 3');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bases de datos 1');
    expect(fixture.nativeElement.textContent).toContain('sesión 1 de 3');
  });

  it('la etiqueta de severidad muestra símbolo y texto, no solo color', () => {
    const fixture = TestBed.createComponent(EtiquetaSeveridad);
    fixture.componentRef.setInput('tipo', 'restriccion');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('✖ Restricción');
    fixture.componentRef.setInput('tipo', 'advertencia');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('⚠ Advertencia');
  });

  it('la celda toma la clase de su tipo de franja', () => {
    const fixture = TestBed.createComponent(Celda);
    fixture.componentRef.setInput('tipo', 'sin-clases');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('sin-clases');
  });
});
