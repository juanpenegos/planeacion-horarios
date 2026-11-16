import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface OpcionDeBloque {
  readonly id: string;
  readonly nombre: string;
}

/** Selector del bloque de semestre que se está planeando. */
@Component({
  selector: 'app-selector-bloque',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selector-bloque.html',
  styleUrl: './selector-bloque.css',
})
export class SelectorBloque {
  readonly opciones = input.required<readonly OpcionDeBloque[]>();
  readonly seleccionado = model.required<string>();
}
