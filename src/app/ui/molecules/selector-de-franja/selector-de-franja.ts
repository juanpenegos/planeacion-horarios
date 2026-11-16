import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { DIAS, Dia, Franja, NOMBRE_DIA } from '../../../domain/models';
import { formatoHora } from '../../../domain/services/formato';
import { Boton } from '../../atoms/boton/boton';

/**
 * «Programar en…»: alternativa al arrastre para usar con teclado o selector.
 * Solo ofrece las horas en que la sesión cabe dentro del horario habilitado.
 */
@Component({
  selector: 'app-selector-de-franja',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Boton],
  templateUrl: './selector-de-franja.html',
  styleUrl: './selector-de-franja.css',
})
export class SelectorDeFranja {
  /** Horas de inicio permitidas por día. */
  readonly inicios = input.required<Record<Dia, number[]>>();
  /** Nombre de la sesión, para los lectores de pantalla. */
  readonly etiqueta = input<string>('la sesión');
  readonly textoBoton = input<string>('Programar en…');
  readonly permitirDevolver = input<boolean>(false);

  readonly elegir = output<Franja>();
  readonly devolver = output<void>();
  readonly abierto = output<boolean>();

  readonly nombreDia = NOMBRE_DIA;
  readonly formatoHora = formatoHora;
  readonly diasDisponibles = computed(() => DIAS.filter((d) => this.inicios()[d].length > 0));
  readonly dia = linkedSignal<Dia>(() => this.diasDisponibles()[0] ?? 'lunes');
  readonly horas = computed(() => this.inicios()[this.dia()] ?? []);
}
