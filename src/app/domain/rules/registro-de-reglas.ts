import { Ra01DiasConsecutivos } from './ra01-dias-consecutivos';
import { Regla } from './regla';
import { Rn01HorarioHabilitado } from './rn01-horario-habilitado';
import { Rn02BloqueSinClases } from './rn02-bloque-sin-clases';
import { Rn03NumeroDeSesiones } from './rn03-numero-de-sesiones';
import { Rn04CruceEnSeccion } from './rn04-cruce-en-seccion';
import { Rn05CruceEnBloque } from './rn05-cruce-en-bloque';

/** Lista de reglas que el verificador evalúa. */
export class RegistroDeReglas {
  private readonly reglas: Regla[] = [];

  registrar(regla: Regla): this {
    if (this.reglas.some((r) => r.id === regla.id)) {
      throw new Error(`La regla ${regla.id} ya está registrada`);
    }
    this.reglas.push(regla);
    return this;
  }

  todas(): readonly Regla[] {
    return this.reglas;
  }
}

/** Registro con las reglas del dominio. Para agregar una regla basta con registrarla aquí. */
export function crearRegistroDelDominio(): RegistroDeReglas {
  return new RegistroDeReglas()
    .registrar(new Rn01HorarioHabilitado())
    .registrar(new Rn02BloqueSinClases())
    .registrar(new Rn03NumeroDeSesiones())
    .registrar(new Rn04CruceEnSeccion())
    .registrar(new Rn05CruceEnBloque())
    .registrar(new Ra01DiasConsecutivos());
}
