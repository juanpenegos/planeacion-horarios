import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DIAS, NOMBRE_DIA, Parametros } from '../../../domain/models';
import { formatoHora } from '../../../domain/services/formato';

interface Fila {
  readonly etiqueta: string;
  readonly valor: string;
}

/** Parámetros vigentes, de solo lectura, junto a la verificación. */
@Component({
  selector: 'app-panel-parametros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './panel-parametros.html',
  styleUrl: './panel-parametros.css',
})
export class PanelParametros {
  readonly parametros = input.required<Parametros>();

  readonly filas = computed<Fila[]>(() => {
    const p = this.parametros();
    const rango = (inicio: number, fin: number) => `${formatoHora(inicio)} a ${formatoHora(fin)}`;
    const filas: Fila[] = [];

    // Agrupa los días seguidos que tienen el mismo horario («Lunes a viernes»).
    let desde = 0;
    for (let i = 1; i <= DIAS.length; i++) {
      const anterior = p.horarioHabilitado[DIAS[i - 1]];
      const actual = i < DIAS.length ? p.horarioHabilitado[DIAS[i]] : null;
      if (!actual || actual.inicio !== anterior.inicio || actual.fin !== anterior.fin) {
        const nombre =
          i - 1 === desde
            ? NOMBRE_DIA[DIAS[desde]]
            : `${NOMBRE_DIA[DIAS[desde]]} a ${NOMBRE_DIA[DIAS[i - 1]].toLowerCase()}`;
        filas.push({ etiqueta: nombre, valor: rango(anterior.inicio, anterior.fin) });
        desde = i;
      }
    }
    filas.push({
      etiqueta: 'Bloque sin clases',
      valor: rango(p.bloqueSinClases.inicio, p.bloqueSinClases.fin),
    });
    filas.push({ etiqueta: 'Duración de la sesión', valor: `${p.duracionSesionHoras} horas` });
    filas.push({ etiqueta: 'Máximo de sesiones semanales', valor: `${p.maximoSesionesSemana}` });
    filas.push({ etiqueta: 'Cupo por sección', valor: `${p.cupoPorSeccion} estudiantes` });
    filas.push({ etiqueta: 'Tolerancia del cupo', valor: `${p.toleranciaCupoPorcentaje} %` });
    return filas;
  });
}
