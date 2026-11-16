import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DIAS, Dia, Franja, NOMBRE_DIA, Parametros } from '../../domain/models';
import { formatoHora } from '../../domain/services/formato';
import { cabeEnHorario, horasDeLaCuadricula, tipoDeFranja } from '../../domain/services/franjas';
import { Celda } from '../atoms/celda';
import { SelectorDeFranja } from '../molecules/selector-de-franja';
import { TarjetaSesion } from '../molecules/tarjeta-sesion';
import { VistaDeSesion } from '../vista-de-sesion';
import { Carril, distribuirEnCarriles } from './carriles';

export interface Programacion {
  readonly sesionId: string;
  readonly franja: Franja;
}

interface SesionEnCelda {
  readonly vista: VistaDeSesion;
  readonly carril: Carril;
}

/**
 * Cuadrícula semanal de lunes a sábado en franjas de una hora. Cada celda recibe
 * sesiones arrastradas; una sesión ocupa tantas franjas como horas dura.
 */
@Component({
  selector: 'app-cuadricula-semanal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, Celda, TarjetaSesion, SelectorDeFranja],
  template: `
    <div
      class="cuadricula"
      role="grid"
      aria-label="Horario semanal"
      [style.grid-template-rows]="'32px repeat(' + horas().length + ', var(--alto-fila))'"
    >
      <div class="esquina" role="columnheader"><span class="solo-lectores">Hora</span></div>
      @for (dia of dias; track dia) {
        <div class="dia" role="columnheader">{{ nombreDia[dia] }}</div>
      }
      @for (hora of horas(); track hora; let fila = $index) {
        <div class="hora" role="rowheader" [style.grid-row]="fila + 2">{{ formatoHora(hora) }}</div>
        @for (dia of dias; track dia; let columna = $index) {
          <app-celda
            role="gridcell"
            cdkDropList
            cdkDropListSortingDisabled
            [cdkDropListData]="{ dia: dia, horaInicio: hora }"
            [cdkDropListEnterPredicate]="permitirSoltar"
            (cdkDropListDropped)="alSoltar($event)"
            [tipo]="tipo(dia, hora)"
            [titulo]="tituloCelda(dia, hora)"
            [attr.data-franja]="dia + '-' + hora"
            [style.grid-row]="fila + 2"
            [style.grid-column]="columna + 2"
          >
            @for (s of porCelda().get(dia + '-' + hora) ?? []; track s.vista.id) {
              <app-tarjeta-sesion
                cdkDrag
                [cdkDragData]="s.vista.id"
                [sesion]="s.vista"
                class="en-cuadricula"
                [class.abierta]="abierta() === s.vista.id"
                [style.height]="'calc(' + duracion() + ' * var(--alto-fila) - 3px)'"
                [style.left]="(s.carril.carril * 100) / s.carril.carriles + '%'"
                [style.width]="'calc(' + 100 / s.carril.carriles + '% - 3px)'"
              >
                <app-selector-de-franja
                  textoBoton="Mover…"
                  [inicios]="inicios()"
                  [etiqueta]="s.vista.asignatura + ' sesión ' + s.vista.numero"
                  [permitirDevolver]="true"
                  (abierto)="abierta.set($event ? s.vista.id : null)"
                  (elegir)="programar.emit({ sesionId: s.vista.id, franja: $event })"
                  (devolver)="devolver.emit(s.vista.id)"
                />
              </app-tarjeta-sesion>
            }
          </app-celda>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      overflow-x: auto;
      --alto-fila: 36px;
    }
    .cuadricula {
      display: grid;
      grid-template-columns: 56px repeat(6, minmax(110px, 1fr));
      min-width: 720px;
      border: 1px solid var(--panel-borde);
      border-radius: 6px;
      overflow: hidden;
    }
    .esquina,
    .dia {
      background: var(--cuadricula-encabezado);
      font-weight: bold;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      grid-row: 1;
    }
    .hora {
      background: var(--horas-fondo);
      color: var(--horas-texto);
      font-size: 11px;
      text-align: right;
      padding: 2px 6px 0 0;
      border-top: 1px solid #eceef2;
      grid-column: 1;
    }
    app-celda.cdk-drop-list-dragging {
      outline: 2px dashed var(--pendiente-borde);
      outline-offset: -2px;
    }
    .en-cuadricula {
      position: absolute;
      top: 1px;
      z-index: 1;
    }
    .en-cuadricula.abierta {
      overflow: visible;
      z-index: 10;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
  `,
})
export class CuadriculaSemanal {
  readonly sesiones = input.required<readonly VistaDeSesion[]>();
  readonly parametros = input.required<Parametros>();
  readonly inicios = input.required<Record<Dia, number[]>>();

  readonly programar = output<Programacion>();
  readonly devolver = output<string>();

  readonly dias = DIAS;
  readonly nombreDia = NOMBRE_DIA;
  readonly formatoHora = formatoHora;
  readonly abierta = signal<string | null>(null);

  readonly horas = computed(() => horasDeLaCuadricula(this.parametros()));
  readonly duracion = computed(() => this.parametros().duracionSesionHoras);

  /** Sesiones programadas agrupadas por la celda donde empiezan («martes-9»). */
  readonly porCelda = computed(() => {
    const mapa = new Map<string, SesionEnCelda[]>();
    for (const dia of DIAS) {
      const delDia = this.sesiones().filter((s) => s.ubicacion?.dia === dia);
      const carriles = distribuirEnCarriles(
        delDia.map((s) => ({
          id: s.id,
          inicio: s.ubicacion!.horaInicio,
          fin: s.ubicacion!.horaInicio + this.duracion(),
        })),
      );
      for (const vista of delDia) {
        const clave = `${dia}-${vista.ubicacion!.horaInicio}`;
        mapa.set(clave, [...(mapa.get(clave) ?? []), { vista, carril: carriles.get(vista.id)! }]);
      }
    }
    return mapa;
  });

  /** Solo se puede soltar donde la sesión cabe dentro del horario habilitado. */
  readonly permitirSoltar = (_: CdkDrag, celda: CdkDropList<Franja>): boolean =>
    cabeEnHorario(this.parametros(), celda.data);

  tipo(dia: Dia, hora: number) {
    return tipoDeFranja(this.parametros(), dia, hora);
  }

  tituloCelda(dia: Dia, hora: number): string | null {
    const tipo = this.tipo(dia, hora);
    if (tipo === 'fuera-de-horario') return 'Fuera del horario habilitado';
    if (tipo === 'sin-clases') return 'Bloque sin clases';
    return null;
  }

  alSoltar(evento: CdkDragDrop<Franja, unknown, string>): void {
    this.programar.emit({ sesionId: evento.item.data, franja: evento.container.data });
  }
}
