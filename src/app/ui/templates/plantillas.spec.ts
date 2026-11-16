import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlantillaTresColumnas } from './plantilla-tres-columnas/plantilla-tres-columnas';
import { PlantillaUnaColumna } from './plantilla-una-columna/plantilla-una-columna';

@Component({
  imports: [PlantillaUnaColumna, PlantillaTresColumnas],
  template: `
    <app-plantilla-una-columna ancho="angosto"
      ><p class="contenido">Uno</p></app-plantilla-una-columna
    >
    <app-plantilla-tres-columnas>
      <p izquierda>Izquierda</p>
      <p centro>Centro</p>
      <p derecha>Derecha</p>
    </app-plantilla-tres-columnas>
  `,
})
class Anfitrion {}

describe('Plantillas', () => {
  it('la plantilla de una columna muestra su contenido con el ancho pedido', () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.detectChanges();
    const plantilla = (fixture.nativeElement as HTMLElement).querySelector(
      'app-plantilla-una-columna',
    )!;
    expect(plantilla.classList).toContain('angosto');
    expect(plantilla.querySelector('.columna .contenido')?.textContent).toBe('Uno');
  });

  it('la plantilla de tres columnas reparte el contenido en izquierda, centro y derecha', () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('aside.izquierda')?.textContent).toBe('Izquierda');
    expect(html.querySelector('section.centro')?.textContent).toBe('Centro');
    expect(html.querySelector('aside.derecha')?.textContent).toBe('Derecha');
  });
});
