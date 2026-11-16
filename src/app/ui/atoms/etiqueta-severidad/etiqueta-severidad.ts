import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TipoRegla } from '../../../domain/models';

/** Etiqueta de severidad con símbolo y texto: el color nunca es el único indicador. */
@Component({
  selector: 'app-etiqueta-severidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'tipo()' },
  templateUrl: './etiqueta-severidad.html',
  styleUrl: './etiqueta-severidad.css',
})
export class EtiquetaSeveridad {
  readonly tipo = input.required<TipoRegla>();
  readonly simbolo = computed(() => (this.tipo() === 'restriccion' ? '✖' : '⚠'));
  readonly texto = computed(() => (this.tipo() === 'restriccion' ? 'Restricción' : 'Advertencia'));
}
