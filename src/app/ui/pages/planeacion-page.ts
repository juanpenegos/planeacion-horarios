import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlaneacionStore } from '../../state/planeacion.store';
import { SelectorBloque } from '../molecules/selector-bloque';
import { CuadriculaSemanal, Programacion } from '../organisms/cuadricula-semanal';
import { PanelPendientes } from '../organisms/panel-pendientes';
import { PlantillaTresColumnas } from '../templates/plantilla-tres-columnas';

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
  template: `
    <app-plantilla-tres-columnas cdkDropListGroup>
      <div izquierda>
        <section class="panel">
          <h2 class="panel-titulo">Bloque de semestre</h2>
          <app-selector-bloque
            [opciones]="store.opcionesDeBloque()"
            [(seleccionado)]="store.grupoSeleccionado"
          />
        </section>
        <app-panel-pendientes
          [sesiones]="store.pendientes()"
          [inicios]="store.inicios()"
          [mensajeVacio]="
            store.sesionesDelGrupo().length === 0
              ? 'Este bloque no tiene secciones. Créalas en la página Secciones.'
              : 'No hay sesiones pendientes.'
          "
          (programar)="programar($event)"
          (devolver)="store.devolver($event)"
        />
      </div>
      <div centro>
        <section class="panel">
          <h2 class="panel-titulo">Horario semanal</h2>
          <app-cuadricula-semanal
            [sesiones]="store.programadas()"
            [parametros]="store.parametros()"
            [inicios]="store.inicios()"
            (programar)="programar($event)"
            (devolver)="store.devolver($event)"
          />
        </section>
      </div>
      <div derecha>
        <section class="panel">
          <h2 class="panel-titulo">Verificación</h2>
          <p>{{ store.textoResumen() }}</p>
        </section>
        <section class="panel">
          <h2 class="panel-titulo">Parámetros</h2>
        </section>
      </div>
    </app-plantilla-tres-columnas>
  `,
})
export class PlaneacionPage {
  readonly store = inject(PlaneacionStore);

  programar({ sesionId, franja }: Programacion): void {
    this.store.programar(sesionId, franja);
  }
}
