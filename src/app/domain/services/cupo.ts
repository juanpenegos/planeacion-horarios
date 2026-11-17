import { Parametros } from '../models';

/**
 * Cupo máximo de referencia por sección: el cupo más su tolerancia, redondeado hacia
 * abajo (40 estudiantes + 10 % = 44). Es informativo: ninguna regla lo usa.
 */
export function cupoMaximo(
  p: Pick<Parametros, 'cupoPorSeccion' | 'toleranciaCupoPorcentaje'>,
): number {
  // Se multiplica antes de dividir para no arrastrar errores de decimales (35 × 1,2).
  return Math.floor((p.cupoPorSeccion * (100 + p.toleranciaCupoPorcentaje)) / 100);
}

/** «Cupo máximo por sección: 44 estudiantes (40 + 10 %)». */
export function textoCupoMaximo(
  p: Pick<Parametros, 'cupoPorSeccion' | 'toleranciaCupoPorcentaje'>,
): string {
  return `Cupo máximo por sección: ${cupoMaximo(p)} estudiantes (${p.cupoPorSeccion} + ${p.toleranciaCupoPorcentaje} %)`;
}
