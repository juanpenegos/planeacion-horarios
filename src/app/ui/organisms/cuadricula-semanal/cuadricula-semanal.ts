import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DIAS, Dia, Franja, NOMBRE_DIA, Parametros } from '../../../domain/models';
import { formatoHora } from '../../../domain/services/formato';
import { cabeEnHorario, horasDeLaCuadricula, tipoDeFranja } from '../../../domain/services/franjas';
import { Celda } from '../../atoms/celda/celda';
import { SelectorDeFranja } from '../../molecules/selector-de-franja/selector-de-franja';
import { TarjetaSesion } from '../../molecules/tarjeta-sesion/tarjeta-sesion';
import { VistaDeSesion } from '../../vista-de-sesion';
import { Carril, distribuirEnCarriles } from '../carriles';

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
  templateUrl: './cuadricula-semanal.html',
  styleUrl: './cuadricula-semanal.css',
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

  /**
   * Si se suelta sobre una celda donde la sesión no cabe, la librería entrega la última
   * celda válida por la que pasó; en ese caso no se programa y la sesión vuelve a su lugar.
   */
  alSoltar(evento: CdkDragDrop<Franja, unknown, string>): void {
    if (!evento.isPointerOverContainer) return;
    this.programar.emit({ sesionId: evento.item.data, franja: evento.container.data });
  }
}
