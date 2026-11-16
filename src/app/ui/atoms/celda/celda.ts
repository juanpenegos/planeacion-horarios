import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Tipo de franja de una celda de la cuadrícula. */
export type TipoDeCelda = 'habilitada' | 'fuera-de-horario' | 'sin-clases';

/** Celda de una hora en la cuadrícula semanal. */
@Component({
  selector: 'app-celda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'tipo()', '[attr.title]': 'titulo()' },
  templateUrl: './celda.html',
  styleUrl: './celda.css',
})
export class Celda {
  readonly tipo = input<TipoDeCelda>('habilitada');
  readonly titulo = input<string | null>(null);
}
