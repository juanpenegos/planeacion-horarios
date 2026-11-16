import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Configuración de los parámetros (HU-02). */
@Component({
  selector: 'app-parametros-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parametros-page.html',
  styleUrl: './parametros-page.css',
})
export class ParametrosPage {}
