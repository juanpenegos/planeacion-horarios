import { Directive, input } from '@angular/core';

/** Botón con el estilo de la aplicación: `<button appBoton variante="primario">`. */
@Directive({
  selector: 'button[appBoton]',
  host: {
    class: 'boton',
    '[class.boton-primario]': "variante() === 'primario'",
    '[class.boton-enlace]': "variante() === 'enlace'",
  },
})
export class Boton {
  readonly variante = input<'primario' | 'secundario' | 'enlace'>('secundario');
}
