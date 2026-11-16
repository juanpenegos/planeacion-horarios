import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TipoRegla } from '../../domain/models';

/** Etiqueta de severidad con símbolo y texto: el color nunca es el único indicador. */
@Component({
  selector: 'app-etiqueta-severidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'tipo()' },
  template: `<span aria-hidden="true">{{ simbolo() }}</span> {{ texto() }}`,
  styles: `
    :host {
      display: inline-block;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 1px 6px;
      border-radius: 4px;
    }
    :host(.restriccion) {
      color: #8b1f1f;
      background: var(--restriccion-fondo);
    }
    :host(.advertencia) {
      color: #6b5200;
      background: var(--advertencia-fondo);
    }
  `,
})
export class EtiquetaSeveridad {
  readonly tipo = input.required<TipoRegla>();
  readonly simbolo = computed(() => (this.tipo() === 'restriccion' ? '✖' : '⚠'));
  readonly texto = computed(() => (this.tipo() === 'restriccion' ? 'Restricción' : 'Advertencia'));
}
