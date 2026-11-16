import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlantillaTresColumnas } from '../templates/plantilla-tres-columnas';

/** Pantalla principal: bloque y pendientes, cuadrícula semanal, verificación y parámetros. */
@Component({
  selector: 'app-planeacion-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlantillaTresColumnas],
  template: `
    <app-plantilla-tres-columnas>
      <div izquierda>
        <section class="panel">
          <h2 class="panel-titulo">Bloque de semestre</h2>
        </section>
        <section class="panel">
          <h2 class="panel-titulo">Sesiones pendientes</h2>
        </section>
      </div>
      <div centro>
        <section class="panel">
          <h2 class="panel-titulo">Horario semanal</h2>
        </section>
      </div>
      <div derecha>
        <section class="panel">
          <h2 class="panel-titulo">Verificación</h2>
        </section>
        <section class="panel">
          <h2 class="panel-titulo">Parámetros</h2>
        </section>
      </div>
    </app-plantilla-tres-columnas>
  `,
})
export class PlaneacionPage {}
