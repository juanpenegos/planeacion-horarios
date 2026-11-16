import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Encabezado institucional con el título y la navegación entre páginas. */
@Component({
  selector: 'app-encabezado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css',
})
export class Encabezado {
  readonly enlaces = [
    { ruta: '/planeacion', texto: 'Planeación' },
    { ruta: '/plan-de-estudios', texto: 'Plan de estudios' },
    { ruta: '/secciones', texto: 'Secciones' },
    { ruta: '/parametros', texto: 'Parámetros' },
  ];
}
