import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { SelectorBloque } from '../../molecules/selector-bloque/selector-bloque';
import {
  CuadriculaSemanal,
  Programacion,
} from '../../organisms/cuadricula-semanal/cuadricula-semanal';
import { PanelPendientes } from '../../organisms/panel-pendientes/panel-pendientes';
import { PlantillaTresColumnas } from '../../templates/plantilla-tres-columnas/plantilla-tres-columnas';

/** Pantalla principal: bloque y pendientes, cuadrícula semanal, verificación y parámetros. */
@Component({
  selector: 'app-planeacion-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDropListGroup,
    PlantillaTresColumnas,
    SelectorBloque,
    PanelPendientes,
    CuadriculaSemanal,
  ],
  templateUrl: './planeacion-page.html',
  styleUrl: './planeacion-page.css',
})
export class PlaneacionPage {
  readonly store = inject(PlaneacionStore);

  programar({ sesionId, franja }: Programacion): void {
    this.store.programar(sesionId, franja);
  }
}
