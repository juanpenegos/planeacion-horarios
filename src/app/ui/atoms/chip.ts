import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Chip de una sesión pendiente: asignatura arriba y detalle abajo. */
@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="titulo">{{ titulo() }}</span>
    <span class="detalle">{{ detalle() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: var(--pendiente-fondo);
      border: 1px solid var(--pendiente-borde);
      border-radius: var(--chip-radio);
      padding: 6px 8px;
      cursor: grab;
      font-size: 12px;
    }
    .titulo {
      font-weight: bold;
    }
    .detalle {
      color: #444;
    }
  `,
})
export class Chip {
  readonly titulo = input.required<string>();
  readonly detalle = input<string>('');
}
