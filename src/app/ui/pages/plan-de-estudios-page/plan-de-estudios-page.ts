import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Consulta del plan de estudios (HU-01). */
@Component({
  selector: 'app-plan-de-estudios-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-de-estudios-page.html',
  styleUrl: './plan-de-estudios-page.css',
})
export class PlanDeEstudiosPage {}
