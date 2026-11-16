import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Configuración de los parámetros (HU-02). */
@Component({
  selector: 'app-parametros-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagina">
      <section class="panel">
        <h2 class="panel-titulo">Parámetros</h2>
      </section>
    </div>
  `,
})
export class ParametrosPage {}
