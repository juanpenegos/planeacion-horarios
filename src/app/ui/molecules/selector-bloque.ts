import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface OpcionDeBloque {
  readonly id: string;
  readonly nombre: string;
}

/** Selector del bloque de semestre que se está planeando. */
@Component({
  selector: 'app-selector-bloque',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label for="selector-bloque" class="solo-lectores">Bloque de semestre</label>
    <select
      id="selector-bloque"
      [value]="seleccionado()"
      (change)="seleccionado.set($any($event.target).value)"
    >
      @for (opcion of opciones(); track opcion.id) {
        <option [value]="opcion.id" [selected]="opcion.id === seleccionado()">
          {{ opcion.nombre }}
        </option>
      }
    </select>
  `,
  styles: `
    select {
      width: 100%;
      padding: 6px;
      border: 1px solid var(--panel-borde);
      border-radius: 4px;
      background: #fff;
    }
  `,
})
export class SelectorBloque {
  readonly opciones = input.required<readonly OpcionDeBloque[]>();
  readonly seleccionado = model.required<string>();
}
