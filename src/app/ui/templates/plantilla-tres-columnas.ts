import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Plantilla de la pantalla de planeación: 270px | 1fr | 300px; se apila en pantallas estrechas. */
@Component({
  selector: 'app-plantilla-tres-columnas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="columnas">
      <aside class="izquierda"><ng-content select="[izquierda]" /></aside>
      <section class="centro"><ng-content select="[centro]" /></section>
      <aside class="derecha"><ng-content select="[derecha]" /></aside>
    </div>
  `,
  styles: `
    .columnas {
      display: grid;
      grid-template-columns: 270px minmax(0, 1fr) 300px;
      gap: var(--separacion);
      padding: var(--separacion);
      align-items: start;
    }
    @media (max-width: 1100px) {
      .columnas {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class PlantillaTresColumnas {}
