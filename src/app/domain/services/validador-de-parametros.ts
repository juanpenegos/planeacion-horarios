import { DIAS, Intervalo, NOMBRE_DIA, Parametros } from '../models';

/** Revisa que los parámetros tengan sentido antes de guardarlos (HU-02). */
export class ValidadorDeParametros {
  errores(p: Parametros): string[] {
    const errores: string[] = [];
    const intervaloValido = (i: Intervalo) =>
      Number.isInteger(i.inicio) &&
      Number.isInteger(i.fin) &&
      i.inicio >= 0 &&
      i.fin <= 24 &&
      i.inicio < i.fin;

    for (const dia of DIAS) {
      if (!intervaloValido(p.horarioHabilitado[dia])) {
        errores.push(
          `${NOMBRE_DIA[dia]}: la hora de inicio debe ser menor que la de fin, entre 0 y 24`,
        );
      }
    }
    if (!intervaloValido(p.bloqueSinClases)) {
      errores.push('Bloque sin clases: la hora de inicio debe ser menor que la de fin');
    }
    if (!Number.isInteger(p.duracionSesionHoras) || p.duracionSesionHoras < 1) {
      errores.push('La duración de la sesión debe ser un número entero de horas, mínimo 1');
    }
    if (!Number.isInteger(p.maximoSesionesSemana) || p.maximoSesionesSemana < 1) {
      errores.push('El máximo de sesiones semanales debe ser un número entero, mínimo 1');
    }
    return errores;
  }
}
