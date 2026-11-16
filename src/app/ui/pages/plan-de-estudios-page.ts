import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Consulta del plan de estudios (HU-01). */
@Component({
  selector: 'app-plan-de-estudios-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagina">
      <section class="panel">
        <h2 class="panel-titulo">Plan de estudios</h2>
      </section>
    </div>
  `,
})
export class PlanDeEstudiosPage {}
