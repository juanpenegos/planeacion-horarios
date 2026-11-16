import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Ancho máximo del contenido: completo, medio (960px) o angosto (720px). */
export type AnchoDePagina = 'completo' | 'medio' | 'angosto';

/**
 * Plantilla de las páginas de consulta y configuración (Plan de estudios, Secciones y
 * Parámetros): una columna de paneles apilados con la separación de la interfaz.
 */
@Component({
  selector: 'app-plantilla-una-columna',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plantilla-una-columna.html',
  styleUrl: './plantilla-una-columna.css',
  host: { '[class]': 'ancho()' },
})
export class PlantillaUnaColumna {
  readonly ancho = input<AnchoDePagina>('completo');
}
