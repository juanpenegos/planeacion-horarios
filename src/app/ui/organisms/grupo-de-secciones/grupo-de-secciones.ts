import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GrupoDeSecciones } from '../../../state/planeacion.store';
import { Boton } from '../../atoms/boton/boton';

/** Un bloque de semestre (o el grupo fuera de bloque) con sus secciones y cómo agregar más. */
@Component({
  selector: 'app-grupo-de-secciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Boton],
  templateUrl: './grupo-de-secciones.html',
  styleUrl: './grupo-de-secciones.css',
})
export class GrupoDeSeccionesComponent {
  readonly grupo = input.required<GrupoDeSecciones>();

  readonly crearSeccion = output<string>();
  readonly crearTodas = output<void>();
  readonly eliminarSeccion = output<string>();
  readonly eliminarBloque = output<void>();
}
