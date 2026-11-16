import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Dia } from '../../../domain/models';
import { Chip } from '../../atoms/chip/chip';
import { SelectorDeFranja } from '../../molecules/selector-de-franja/selector-de-franja';
import { VistaDeSesion } from '../../vista-de-sesion';
import { Programacion } from '../cuadricula-semanal/cuadricula-semanal';

/** Sesiones sin día ni hora. Se arrastran a la cuadrícula y también reciben las devueltas. */
@Component({
  selector: 'app-panel-pendientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, Chip, SelectorDeFranja],
  templateUrl: './panel-pendientes.html',
  styleUrl: './panel-pendientes.css',
})
export class PanelPendientes {
  readonly sesiones = input.required<readonly VistaDeSesion[]>();
  readonly inicios = input.required<Record<Dia, number[]>>();
  readonly mensajeVacio = input<string>('No hay sesiones pendientes.');

  readonly programar = output<Programacion>();
  readonly devolver = output<string>();

  alSoltar(evento: CdkDragDrop<string, unknown, string>): void {
    if (evento.previousContainer !== evento.container) this.devolver.emit(evento.item.data);
  }
}
