import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Descargador } from '../../../data/descargador';
import { ErrorDePlaneacion, Parametros } from '../../../domain/models';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { FormularioParametros } from '../../organisms/formulario-parametros/formulario-parametros';
import { PanelCopia } from '../../organisms/panel-copia/panel-copia';

/** Configuración de los parámetros (HU-02, ENF-01) y copia de la planeación (ENF-05). */
@Component({
  selector: 'app-parametros-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioParametros, PanelCopia],
  templateUrl: './parametros-page.html',
  styleUrl: './parametros-page.css',
})
export class ParametrosPage {
  readonly store = inject(PlaneacionStore);
  private readonly descargador = inject(Descargador);

  readonly guardado = signal(false);
  readonly mensajeCopia = signal<string | null>(null);
  readonly errorCopia = signal<string | null>(null);

  guardar(parametros: Parametros): void {
    this.store.cambiarParametros(parametros);
    this.guardado.set(true);
  }

  exportarJson(): void {
    this.descargador.descargar('planeacion.json', this.store.exportarJson(), 'application/json');
    this.errorCopia.set(null);
    this.mensajeCopia.set('Planeación exportada');
  }

  importarJson(texto: string): void {
    try {
      this.store.importarJson(texto);
      this.errorCopia.set(null);
      this.mensajeCopia.set('Planeación importada');
    } catch (e) {
      if (!(e instanceof ErrorDePlaneacion)) throw e;
      this.mensajeCopia.set(null);
      this.errorCopia.set(e.message);
    }
  }
}
