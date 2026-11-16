import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { DIAS, Dia, Franja, NOMBRE_DIA } from '../../domain/models';
import { formatoHora } from '../../domain/services/formato';
import { Boton } from '../atoms/boton';

/**
 * «Programar en…»: alternativa al arrastre para usar con teclado o selector.
 * Solo ofrece las horas en que la sesión cabe dentro del horario habilitado.
 */
@Component({
  selector: 'app-selector-de-franja',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Boton],
  template: `
    <details (toggle)="abierto.emit($any($event.target).open)">
      <summary>{{ textoBoton() }}</summary>
      <div class="formulario">
        <label>
          Día
          <select
            [attr.aria-label]="'Día para ' + etiqueta()"
            (change)="dia.set($any($event.target).value)"
          >
            @for (d of diasDisponibles(); track d) {
              <option [value]="d" [selected]="d === dia()">{{ nombreDia[d] }}</option>
            }
          </select>
        </label>
        <label>
          Hora
          <select #hora [attr.aria-label]="'Hora de inicio para ' + etiqueta()">
            @for (h of horas(); track h) {
              <option [value]="h">{{ formatoHora(h) }}</option>
            }
          </select>
        </label>
        <div class="acciones">
          <button
            appBoton
            variante="primario"
            type="button"
            [disabled]="horas().length === 0"
            (click)="elegir.emit({ dia: dia(), horaInicio: +hora.value })"
          >
            Programar
          </button>
          @if (permitirDevolver()) {
            <button appBoton type="button" (click)="devolver.emit()">Devolver a pendientes</button>
          }
        </div>
      </div>
    </details>
  `,
  styles: `
    :host {
      display: block;
      font-size: 11px;
    }
    summary {
      cursor: pointer;
      color: var(--color-vino);
      text-decoration: underline;
      width: fit-content;
    }
    .formulario {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
      padding: 8px;
      background: #fff;
      border: 1px solid var(--panel-borde);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
      min-width: 180px;
      cursor: default;
    }
    label {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      align-items: center;
    }
    .acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  `,
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
