import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Boton } from '../../atoms/boton/boton';

/** Exportar la planeación a un archivo JSON y recuperarla desde uno (ENF-05). */
@Component({
  selector: 'app-panel-copia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Boton],
  templateUrl: './panel-copia.html',
  styleUrl: './panel-copia.css',
})
export class PanelCopia {
  readonly mensaje = input<string | null>(null);
  readonly error = input<string | null>(null);

  readonly exportar = output<void>();
  readonly importar = output<string>();

  async alElegirArchivo(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    if (!archivo) return;
    this.importar.emit(await archivo.text());
    campo.value = '';
  }
}
