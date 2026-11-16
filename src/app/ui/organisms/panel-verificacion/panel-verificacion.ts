import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Incumplimiento } from '../../../domain/models';
import { Resumen } from '../../../domain/services/resumen-de-bloque';
import { Boton } from '../../atoms/boton/boton';
import { FilaAviso } from '../../molecules/fila-aviso/fila-aviso';

/**
 * Estado del bloque (restricciones, advertencias y pendientes), sus avisos y la
 * acción de marcarlo como listo para publicar (HU-05).
 */
@Component({
  selector: 'app-panel-verificacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Boton, FilaAviso],
  templateUrl: './panel-verificacion.html',
  styleUrl: './panel-verificacion.css',
})
export class PanelVerificacion {
  readonly resumen = input.required<Resumen>();
  /** «N restricciones incumplidas · N advertencias · N sesiones pendientes». */
  readonly texto = input.required<string>();
  readonly incumplimientos = input.required<readonly Incumplimiento[]>();
  readonly marcado = input<boolean>(false);
  /** Las secciones fuera de bloque no se publican como bloque. */
  readonly esBloque = input<boolean>(true);

  readonly marcarListo = output<void>();
}
