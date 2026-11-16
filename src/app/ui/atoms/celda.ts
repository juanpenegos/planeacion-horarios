import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Tipo de franja de una celda de la cuadrícula. */
export type TipoDeCelda = 'habilitada' | 'fuera-de-horario' | 'sin-clases';

/** Celda de una hora en la cuadrícula semanal. */
@Component({
  selector: 'app-celda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'tipo()', '[attr.title]': 'titulo()' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      min-height: 32px;
      height: 100%;
      border-top: 1px solid #eceef2;
      border-left: 1px solid #eceef2;
      position: relative;
    }
    :host(.fuera-de-horario) {
      background: repeating-linear-gradient(
        45deg,
        var(--fuera-de-horario-1) 0 6px,
        var(--fuera-de-horario-2) 6px 12px
      );
    }
    :host(.sin-clases) {
      background: var(--bloque-sin-clases);
    }
  `,
})
export class Celda {
  readonly tipo = input<TipoDeCelda>('habilitada');
  readonly titulo = input<string | null>(null);
}
