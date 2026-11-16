import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Chip de una sesión pendiente: asignatura arriba y detalle abajo. */
@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {
  readonly titulo = input.required<string>();
  readonly detalle = input<string>('');
}
