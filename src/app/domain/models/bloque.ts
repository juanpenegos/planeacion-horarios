import { Semestre } from './asignatura';

/** Semestres que forman bloque (el IX solo tiene asignaturas fuera de bloque). */
export const SEMESTRES_CON_BLOQUE: readonly Semestre[] = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
];

/**
 * Bloque de semestre: secciones de las asignaturas obligatorias de un semestre
 * que no deben cruzarse entre sí. Un semestre puede tener varios bloques (01, 02…).
 */
export interface Bloque {
  readonly id: string;
  readonly semestre: Semestre;
  readonly numero: string;
}

export function crearBloque(semestre: Semestre, numero: string): Bloque {
  return { id: `${semestre}-${numero}`, semestre, numero };
}

/** Texto con que se muestra el bloque, por ejemplo «Semestre IV – sección 01». */
export function nombreDeBloque(bloque: Bloque): string {
  return `Semestre ${bloque.semestre} – sección ${bloque.numero}`;
}
