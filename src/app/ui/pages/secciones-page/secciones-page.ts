import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Definición de secciones y bloques (HU-03). */
@Component({
  selector: 'app-secciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secciones-page.html',
  styleUrl: './secciones-page.css',
})
export class SeccionesPage {}
