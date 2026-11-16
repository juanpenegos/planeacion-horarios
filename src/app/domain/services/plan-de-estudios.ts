import { Asignatura, Semestre } from '../models';

/** Consultas sobre el plan de estudios que se usan en varias partes del sistema. */
export class PlanDeEstudios {
  constructor(private readonly asignaturas: readonly Asignatura[]) {}

  todas(): readonly Asignatura[] {
    return this.asignaturas;
  }

  programables(): Asignatura[] {
    return this.asignaturas.filter((a) => a.programable);
  }

  enBloque(semestre?: Semestre): Asignatura[] {
    return this.asignaturas.filter(
      (a) => a.alcance === 'bloque' && (semestre === undefined || a.semestre === semestre),
    );
  }

  fueraDeBloque(): Asignatura[] {
    return this.asignaturas.filter((a) => a.alcance === 'fuera-de-bloque');
  }

  buscar(id: string): Asignatura | undefined {
    return this.asignaturas.find((a) => a.id === id);
  }

  creditosPorSemestre(): Map<Semestre, number> {
    const creditos = new Map<Semestre, number>();
    for (const a of this.asignaturas) {
      creditos.set(a.semestre, (creditos.get(a.semestre) ?? 0) + a.creditos);
    }
    return creditos;
  }
}
