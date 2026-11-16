import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Botón con el estilo de la aplicación: `<button app-boton variante="primario">`. */
@Component({
  selector: 'button[app-boton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'variante()' },
  templateUrl: './boton.html',
  styleUrl: './boton.css',
})
export class Boton {
  readonly variante = input<'primario' | 'secundario' | 'enlace'>('secundario');
}
