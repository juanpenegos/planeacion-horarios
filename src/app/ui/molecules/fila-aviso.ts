import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Incumplimiento } from '../../domain/models';
import { EtiquetaSeveridad } from '../atoms/etiqueta-severidad';

/** Aviso de una regla incumplida: etiqueta de severidad y mensaje con los involucrados. */
@Component({
  selector: 'app-fila-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EtiquetaSeveridad],
  host: { '[class]': 'incumplimiento().tipo', role: 'listitem' },
  template: `
    <app-etiqueta-severidad [tipo]="incumplimiento().tipo" />
    <p>{{ incumplimiento().mensaje }}</p>
  `,
  styles: `
    :host {
      display: block;
      border-left: 4px solid var(--restriccion-borde);
      background: var(--aviso-restriccion-fondo);
      padding: 6px 8px;
      border-radius: 0 4px 4px 0;
      font-size: 12px;
    }
    :host(.advertencia) {
      border-left-color: var(--advertencia-borde);
      background: var(--aviso-advertencia-fondo);
    }
    p {
      margin: 4px 0 0;
    }
  `,
})
export class FilaAviso {
  readonly incumplimiento = input.required<Incumplimiento>();
}
