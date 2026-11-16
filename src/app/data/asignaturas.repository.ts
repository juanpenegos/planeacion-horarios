import { Injectable } from '@angular/core';
import datos from '../../assets/data/asignaturas.json';
import { Asignatura } from '../domain/models';

/** Puerta de acceso al plan de estudios. */
export abstract class AsignaturasRepository {
  abstract todas(): readonly Asignatura[];
}

/** Lee el plan de estudios PEP 2025 de `src/assets/data/asignaturas.json`. */
@Injectable()
export class JsonAsignaturasRepository extends AsignaturasRepository {
  private readonly asignaturas = datos as Asignatura[];

  todas(): readonly Asignatura[] {
    return this.asignaturas;
  }
}
