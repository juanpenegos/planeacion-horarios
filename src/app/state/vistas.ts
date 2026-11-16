import { Asignatura, Incumplimiento, Planeacion, nombreDeBloque } from '../domain/models';
import { ContextoDeVerificacion } from '../domain/rules/contexto-de-verificacion';
import { EditorDePlaneacion } from '../domain/services/editor-de-planeacion';
import { formatoFranja } from '../domain/services/formato';
import { PlanDeEstudios } from '../domain/services/plan-de-estudios';
import { ResumenDeBloque } from '../domain/services/resumen-de-bloque';
import { VistaDeSesion } from './vista-de-sesion';

/** Identificador del grupo de secciones fuera de bloque en el selector. */
export const FUERA_DE_BLOQUE = 'fuera-de-bloque';

/** Sección tal como se lista en la página Secciones. */
export interface VistaDeSeccion {
  readonly id: string;
  readonly asignatura: string;
  readonly numero: string;
  readonly sesiones: number;
  readonly horas: number;
}

/** Un bloque de semestre (o el grupo fuera de bloque) con sus secciones. */
export interface GrupoDeSecciones {
  readonly id: string;
  readonly nombre: string;
  readonly bloqueId: string | null;
  readonly secciones: readonly VistaDeSeccion[];
  /** Asignaturas programables que todavía se pueden agregar. */
  readonly disponibles: readonly Asignatura[];
}

/** Convierte las sesiones del bloque en datos listos para la interfaz. */
export function armarVistasDeSesion(
  contexto: ContextoDeVerificacion,
  incumplimientos: readonly Incumplimiento[],
  resumidor: ResumenDeBloque,
): VistaDeSesion[] {
  const duracion = contexto.parametros.duracionSesionHoras;
  return contexto.sesiones.map((sesion) => {
    const seccion = contexto.seccion(sesion);
    return {
      id: sesion.id,
      asignatura: contexto.asignaturaDeSeccion(seccion).nombre,
      seccion: seccion.numero,
      numero: sesion.numero,
      total: contexto.sesionesDeSeccion(seccion.id).length,
      franja: sesion.franja ? formatoFranja(sesion.franja, duracion) : null,
      ubicacion: sesion.franja,
      estado: resumidor.estadoDeSesion(sesion, incumplimientos),
    };
  });
}

/** Bloques con sus secciones y las asignaturas que aún se pueden agregar (HU-03). */
export function armarGruposDeSecciones(
  p: Planeacion,
  plan: PlanDeEstudios,
  editor: EditorDePlaneacion,
): GrupoDeSecciones[] {
  const vista = (bloqueId: string | null): VistaDeSeccion[] =>
    editor.seccionesDe(p, bloqueId).map((s) => ({
      id: s.id,
      asignatura: plan.buscar(s.asignaturaId)?.nombre ?? s.asignaturaId,
      numero: s.numero,
      sesiones: p.sesiones.filter((x) => x.seccionId === s.id).length,
      horas: plan.buscar(s.asignaturaId)?.horasDirectasSemana ?? 0,
    }));
  const bloques = p.bloques.map((b) => {
    const usadas = new Set(editor.seccionesDe(p, b.id).map((s) => s.asignaturaId));
    return {
      id: b.id,
      nombre: nombreDeBloque(b),
      bloqueId: b.id as string | null,
      secciones: vista(b.id),
      disponibles: plan.enBloque(b.semestre).filter((a) => !usadas.has(a.id)),
    };
  });
  return [
    ...bloques,
    {
      id: FUERA_DE_BLOQUE,
      nombre: 'Fuera de bloque (electivas de profundización y Trabajo de grado)',
      bloqueId: null,
      secciones: vista(null),
      disponibles: plan.fueraDeBloque(),
    },
  ];
}
