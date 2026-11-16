/** Semestres del plan de estudios PEP 2025. */
export const SEMESTRES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const;
export type Semestre = (typeof SEMESTRES)[number];

/** Componente al que pertenece la asignatura dentro del plan. */
export type Alcance = 'bloque' | 'fuera-de-bloque' | 'fundamentacion' | 'libre-escogencia';

/** Espacio académico del plan de estudios. */
export interface Asignatura {
  readonly id: string;
  readonly semestre: Semestre;
  readonly nombre: string;
  readonly caracter: string;
  readonly creditos: number;
  readonly horasDirectasSemana: number;
  readonly alcance: Alcance;
  readonly programable: boolean;
}
