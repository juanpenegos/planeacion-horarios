import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ErrorDePlaneacion } from '../../../domain/models';
import { FUERA_DE_BLOQUE, PlaneacionStore } from '../../../state/planeacion.store';
import { SelectorBloque } from '../../molecules/selector-bloque/selector-bloque';
import {
  CuadriculaSemanal,
  Programacion,
} from '../../organisms/cuadricula-semanal/cuadricula-semanal';
import { PanelParametros } from '../../organisms/panel-parametros/panel-parametros';
import { PanelPendientes } from '../../organisms/panel-pendientes/panel-pendientes';
import { PanelVerificacion } from '../../organisms/panel-verificacion/panel-verificacion';
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
    PanelVerificacion,
    PanelParametros,
  ],
  templateUrl: './planeacion-page.html',
  styleUrl: './planeacion-page.css',
})
export class PlaneacionPage {
  readonly store = inject(PlaneacionStore);
  readonly fueraDeBloque = FUERA_DE_BLOQUE;
  readonly error = signal<string | null>(null);

  programar({ sesionId, franja }: Programacion): void {
    this.error.set(null);
    this.store.programar(sesionId, franja);
  }

  marcarComoListo(): void {
    try {
      this.store.marcarComoListo();
      this.error.set(null);
    } catch (e) {
      if (!(e instanceof ErrorDePlaneacion)) throw e;
      this.error.set(e.message);
    }
  }
}
