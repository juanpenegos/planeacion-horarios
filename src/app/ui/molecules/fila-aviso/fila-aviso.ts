import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Incumplimiento } from '../../../domain/models';
import { EtiquetaSeveridad } from '../../atoms/etiqueta-severidad/etiqueta-severidad';

/** Aviso de una regla incumplida: etiqueta de severidad y mensaje con los involucrados. */
@Component({
  selector: 'app-fila-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EtiquetaSeveridad],
  host: { '[class]': 'incumplimiento().tipo', role: 'listitem' },
  templateUrl: './fila-aviso.html',
  styleUrl: './fila-aviso.css',
})
export class FilaAviso {
  readonly incumplimiento = input.required<Incumplimiento>();
}
