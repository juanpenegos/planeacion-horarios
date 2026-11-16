import { DIAS, NOMBRE_DIA } from '../models';
import { ContextoDeVerificacion } from '../rules/contexto-de-verificacion';
import { formatoHora } from './formato';

export const ENCABEZADOS_CSV = [
  'Asignatura',
  'Sección',
  'Bloque',
  'Día',
  'Hora de inicio',
  'Hora de fin',
] as const;

/** Oferta programada de un bloque como CSV: una fila por sesión (HU-06). */
export class ExportadorCsv {
  exportar(contexto: ContextoDeVerificacion, nombreDelBloque: string): string {
    const filas = contexto
      .programadas()
      .sort(
        (a, b) =>
          DIAS.indexOf(a.franja.dia) - DIAS.indexOf(b.franja.dia) ||
          a.franja.horaInicio - b.franja.horaInicio,
      )
      .map((sesion) => {
        const seccion = contexto.seccion(sesion);
        return [
          contexto.asignaturaDeSeccion(seccion).nombre,
          seccion.numero,
          nombreDelBloque,
          NOMBRE_DIA[sesion.franja.dia],
          formatoHora(sesion.franja.horaInicio),
          formatoHora(contexto.horaFin(sesion.franja)),
        ];
      });
    return [ENCABEZADOS_CSV, ...filas].map((f) => f.map(celda).join(',')).join('\r\n') + '\r\n';
  }
}

/** Encierra entre comillas los valores que tienen comas, comillas o saltos de línea. */
function celda(valor: string): string {
  return /[",\r\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}
