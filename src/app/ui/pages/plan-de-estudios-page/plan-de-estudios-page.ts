import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SEMESTRES, Semestre } from '../../../domain/models';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { TablaAsignaturas } from '../../organisms/tabla-asignaturas/tabla-asignaturas';

/** Consulta del plan de estudios PEP 2025 (HU-01). */
@Component({
  selector: 'app-plan-de-estudios-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TablaAsignaturas],
  templateUrl: './plan-de-estudios-page.html',
  styleUrl: './plan-de-estudios-page.css',
})
export class PlanDeEstudiosPage {
  private readonly plan = inject(PlaneacionStore).plan;

  readonly semestres = SEMESTRES;
  readonly total = this.plan.todas().length;
  readonly programables = this.plan.programables().length;
  readonly enBloque = this.plan.enBloque().length;
  readonly fueraDeBloque = this.plan.fueraDeBloque().length;
  readonly creditos = SEMESTRES.map((s) => ({
    semestre: s,
    creditos: this.plan.creditosPorSemestre().get(s) ?? 0,
  }));

  readonly semestre = signal<Semestre | 'todos'>('todos');
  readonly soloProgramables = signal(false);

  readonly filtradas = computed(() =>
    this.plan
      .todas()
      .filter((a) => this.semestre() === 'todos' || a.semestre === this.semestre())
      .filter((a) => !this.soloProgramables() || a.programable),
  );
}
