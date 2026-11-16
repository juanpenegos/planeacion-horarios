import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Plantilla de la pantalla de planeación: 270px | 1fr | 300px; se apila en pantallas estrechas. */
@Component({
  selector: 'app-plantilla-tres-columnas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plantilla-tres-columnas.html',
  styleUrl: './plantilla-tres-columnas.css',
})
export class PlantillaTresColumnas {}
