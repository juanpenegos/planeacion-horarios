import { NOMBRE_DIA, TipoRegla } from '../models';
import { Franja } from '../models';

/** 9 → «9:00»; 9.5 → «9:30». */
export function formatoHora(hora: number): string {
  const horas = Math.floor(hora);
  const minutos = Math.round((hora - horas) * 60);
  return `${horas}:${minutos.toString().padStart(2, '0')}`;
}

/** «martes 9:00–11:00». */
export function formatoFranja(franja: Franja, duracionHoras: number): string {
  const dia = NOMBRE_DIA[franja.dia].toLowerCase();
  return `${dia} ${formatoHora(franja.horaInicio)}–${formatoHora(franja.horaInicio + duracionHoras)}`;
}

export const NOMBRE_SEVERIDAD: Readonly<Record<TipoRegla, string>> = {
  restriccion: 'restricción',
  advertencia: 'advertencia',
};
