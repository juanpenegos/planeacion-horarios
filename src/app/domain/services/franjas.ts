import { DIAS, Dia, Franja, Parametros } from '../models';

/** Horas de inicio en que una sesión cabe completa dentro del horario habilitado del día. */
export function iniciosPermitidos(parametros: Parametros, dia: Dia): number[] {
  const { inicio, fin } = parametros.horarioHabilitado[dia];
  const inicios: number[] = [];
  for (let hora = inicio; hora + parametros.duracionSesionHoras <= fin; hora++) {
    inicios.push(hora);
  }
  return inicios;
}

/** Inicios permitidos para cada día de la semana. */
export function iniciosPorDia(parametros: Parametros): Record<Dia, number[]> {
  return Object.fromEntries(DIAS.map((d) => [d, iniciosPermitidos(parametros, d)])) as Record<
    Dia,
    number[]
  >;
}

/** La cuadrícula solo deja soltar una sesión donde cabe dentro del horario habilitado (HU-02). */
export function cabeEnHorario(parametros: Parametros, franja: Franja): boolean {
  const { inicio, fin } = parametros.horarioHabilitado[franja.dia];
  return franja.horaInicio >= inicio && franja.horaInicio + parametros.duracionSesionHoras <= fin;
}

/** Horas que muestra la cuadrícula: desde la apertura más temprana hasta el cierre más tardío. */
export function horasDeLaCuadricula(parametros: Parametros): number[] {
  const horarios = DIAS.map((d) => parametros.horarioHabilitado[d]);
  const desde = Math.min(...horarios.map((h) => h.inicio));
  const hasta = Math.max(...horarios.map((h) => h.fin));
  return Array.from({ length: Math.max(0, hasta - desde) }, (_, i) => desde + i);
}

export type TipoDeFranja = 'habilitada' | 'fuera-de-horario' | 'sin-clases';

/** Tipo de la franja de una hora, para sombrear la cuadrícula. */
export function tipoDeFranja(parametros: Parametros, dia: Dia, hora: number): TipoDeFranja {
  const { inicio, fin } = parametros.horarioHabilitado[dia];
  if (hora < inicio || hora + 1 > fin) return 'fuera-de-horario';
  const bloque = parametros.bloqueSinClases;
  if (hora < bloque.fin && hora + 1 > bloque.inicio) return 'sin-clases';
  return 'habilitada';
}
