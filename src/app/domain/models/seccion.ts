/** Grupo en que se ofrece una asignatura. Las secciones fuera de bloque tienen `bloqueId` nulo. */
export interface Seccion {
  readonly id: string;
  readonly asignaturaId: string;
  readonly numero: string;
  readonly bloqueId: string | null;
}
