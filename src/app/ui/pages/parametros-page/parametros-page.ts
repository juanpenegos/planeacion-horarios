import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Parametros } from '../../../domain/models';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { FormularioParametros } from '../../organisms/formulario-parametros/formulario-parametros';

/** Configuración de los parámetros; se guardan sin recompilar (HU-02, ENF-01). */
@Component({
  selector: 'app-parametros-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormularioParametros],
  templateUrl: './parametros-page.html',
  styleUrl: './parametros-page.css',
})
export class ParametrosPage {
  readonly store = inject(PlaneacionStore);
  readonly guardado = signal(false);

  guardar(parametros: Parametros): void {
    this.store.cambiarParametros(parametros);
    this.guardado.set(true);
  }
}
