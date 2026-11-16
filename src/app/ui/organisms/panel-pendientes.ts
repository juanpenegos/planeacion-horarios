import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Dia } from '../../domain/models';
import { Chip } from '../atoms/chip';
import { SelectorDeFranja } from '../molecules/selector-de-franja';
import { VistaDeSesion } from '../vista-de-sesion';
import { Programacion } from './cuadricula-semanal';

/** Sesiones sin día ni hora. Se arrastran a la cuadrícula y también reciben las devueltas. */
@Component({
  selector: 'app-panel-pendientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, Chip, SelectorDeFranja],
  template: `
    <section class="panel">
      <h2 class="panel-titulo">Sesiones pendientes ({{ sesiones().length }})</h2>
      <ul
        class="lista"
        cdkDropList
        cdkDropListSortingDisabled
        [cdkDropListData]="'pendientes'"
        (cdkDropListDropped)="alSoltar($event)"
        aria-label="Sesiones pendientes"
      >
        @for (s of sesiones(); track s.id) {
          <li cdkDrag [cdkDragData]="s.id">
            <app-chip
              [titulo]="s.asignatura"
              [detalle]="'Sección ' + s.seccion + ' · sesión ' + s.numero + ' de ' + s.total"
            />
            <app-selector-de-franja
              [inicios]="inicios()"
              [etiqueta]="s.asignatura + ' sesión ' + s.numero"
              (elegir)="programar.emit({ sesionId: s.id, franja: $event })"
            />
          </li>
        } @empty {
          <li class="vacio">{{ mensajeVacio() }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    .lista {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 48px;
    }
    .lista.cdk-drop-list-dragging {
      outline: 2px dashed var(--pendiente-borde);
      outline-offset: 2px;
      border-radius: 6px;
    }
    li {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .vacio {
      color: #666;
      font-size: 12px;
    }
  `,
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
