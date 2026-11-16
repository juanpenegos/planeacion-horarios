import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Asignatura, NOMBRE_ALCANCE } from '../../../domain/models';

/** Tabla de asignaturas del plan con semestre, carácter, componente, créditos y horas (HU-01). */
@Component({
  selector: 'app-tabla-asignaturas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabla-asignaturas.html',
  styleUrl: './tabla-asignaturas.css',
})
export class TablaAsignaturas {
  readonly asignaturas = input.required<readonly Asignatura[]>();
  readonly nombreAlcance = NOMBRE_ALCANCE;
}
