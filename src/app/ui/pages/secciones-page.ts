import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Definición de secciones y bloques (HU-03). */
@Component({
  selector: 'app-secciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagina">
      <section class="panel">
        <h2 class="panel-titulo">Secciones</h2>
      </section>
    </div>
  `,
})
export class SeccionesPage {}
