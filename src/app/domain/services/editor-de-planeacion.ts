import {
  Bloque,
  ErrorDePlaneacion,
  Franja,
  Parametros,
  Planeacion,
  Seccion,
  Semestre,
  Sesion,
  crearBloque,
} from '../models';
import { ContextoDeVerificacion } from '../rules/contexto-de-verificacion';
import { GeneradorDeSesiones } from './generador-de-sesiones';
import { PlanDeEstudios } from './plan-de-estudios';
import { Resumen } from './resumen-de-bloque';

/**
 * Operaciones del Director sobre la planeación. Cada operación devuelve una
 * planeación nueva y no modifica la anterior.
 */
export class EditorDePlaneacion {
  constructor(
    private readonly plan: PlanDeEstudios,
    private readonly generador = new GeneradorDeSesiones(),
  ) {}

  /** Crea el siguiente bloque del semestre (01, 02…). */
  crearBloque(planeacion: Planeacion, semestre: Semestre): Planeacion {
    if (this.plan.enBloque(semestre).length === 0) {
      throw new ErrorDePlaneacion(`El semestre ${semestre} no tiene asignaturas en bloque`);
    }
    const existentes = planeacion.bloques.filter((b) => b.semestre === semestre).length;
    const bloque = crearBloque(semestre, dosDigitos(existentes + 1));
    return { ...planeacion, bloques: [...planeacion.bloques, bloque] };
  }

  /** Crea una sección de la asignatura con sus sesiones pendientes (HU-03). */
  crearSeccion(planeacion: Planeacion, asignaturaId: string, bloqueId: string | null): Planeacion {
    const asignatura = this.plan.buscar(asignaturaId);
    if (!asignatura || !asignatura.programable) {
      throw new ErrorDePlaneacion('Solo se pueden crear secciones de asignaturas programables');
    }
    if (asignatura.alcance === 'bloque') {
      const bloque = planeacion.bloques.find((b) => b.id === bloqueId);
      if (!bloque || bloque.semestre !== asignatura.semestre) {
        throw new ErrorDePlaneacion(
          `${asignatura.nombre} debe ir en un bloque del Semestre ${asignatura.semestre}`,
        );
      }
      if (
        planeacion.secciones.some((s) => s.asignaturaId === asignaturaId && s.bloqueId === bloqueId)
      ) {
        throw new ErrorDePlaneacion(`${asignatura.nombre} ya tiene una sección en este bloque`);
      }
    } else if (bloqueId !== null) {
      throw new ErrorDePlaneacion(`${asignatura.nombre} no pertenece a un bloque de semestre`);
    }

    const numero = this.siguienteNumero(planeacion, asignaturaId);
    const seccion: Seccion = { id: `${asignaturaId}-${numero}`, asignaturaId, numero, bloqueId };
    const sesiones = this.generador.generar(seccion, asignatura, planeacion.parametros);
    return this.desmarcar(
      {
        ...planeacion,
        secciones: [...planeacion.secciones, seccion],
        sesiones: [...planeacion.sesiones, ...sesiones],
      },
      bloqueId,
    );
  }

  eliminarSeccion(planeacion: Planeacion, seccionId: string): Planeacion {
    const seccion = this.seccion(planeacion, seccionId);
    return this.desmarcar(
      {
        ...planeacion,
        secciones: planeacion.secciones.filter((s) => s.id !== seccionId),
        sesiones: planeacion.sesiones.filter((s) => s.seccionId !== seccionId),
      },
      seccion.bloqueId,
    );
  }

  /** Elimina un bloque y sus secciones. */
  eliminarBloque(planeacion: Planeacion, bloqueId: string): Planeacion {
    const secciones = new Set(
      planeacion.secciones.filter((s) => s.bloqueId === bloqueId).map((s) => s.id),
    );
    return {
      ...planeacion,
      bloques: planeacion.bloques.filter((b) => b.id !== bloqueId),
      secciones: planeacion.secciones.filter((s) => !secciones.has(s.id)),
      sesiones: planeacion.sesiones.filter((s) => !secciones.has(s.seccionId)),
      bloquesMarcados: planeacion.bloquesMarcados.filter((id) => id !== bloqueId),
    };
  }

  /** Asigna día y hora a una sesión; también sirve para moverla (HU-04). */
  programar(planeacion: Planeacion, sesionId: string, franja: Franja): Planeacion {
    return this.cambiarFranja(planeacion, sesionId, franja);
  }

  /** Devuelve la sesión a pendientes. */
  devolver(planeacion: Planeacion, sesionId: string): Planeacion {
    return this.cambiarFranja(planeacion, sesionId, null);
  }

  /**
   * Cambia los parámetros (HU-02). Si cambia la duración, cada sección conserva
   * sus primeras sesiones y gana o pierde las que haga falta.
   */
  cambiarParametros(planeacion: Planeacion, parametros: Parametros): Planeacion {
    const sesiones: Sesion[] = [];
    for (const seccion of planeacion.secciones) {
      const asignatura = this.plan.buscar(seccion.asignaturaId);
      if (!asignatura) continue;
      const nuevas = this.generador.generar(seccion, asignatura, parametros);
      const actuales = planeacion.sesiones.filter((s) => s.seccionId === seccion.id);
      sesiones.push(...nuevas.map((nueva, i) => actuales[i] ?? nueva));
    }
    return { ...planeacion, parametros, sesiones, bloquesMarcados: [] };
  }

  /** Marca el bloque como listo para publicar; exige 0 restricciones y 0 pendientes. */
  marcarListo(planeacion: Planeacion, bloqueId: string, resumen: Resumen): Planeacion {
    if (!resumen.listoParaPublicar) {
      throw new ErrorDePlaneacion(
        'El bloque solo se puede marcar como listo con 0 restricciones y 0 sesiones pendientes',
      );
    }
    if (planeacion.bloquesMarcados.includes(bloqueId)) return planeacion;
    return { ...planeacion, bloquesMarcados: [...planeacion.bloquesMarcados, bloqueId] };
  }

  /** Secciones de un bloque, o las de fuera de bloque si `bloqueId` es nulo. */
  seccionesDe(planeacion: Planeacion, bloqueId: string | null): Seccion[] {
    return planeacion.secciones.filter((s) => s.bloqueId === bloqueId);
  }

  /** Contexto con el que se verifica un bloque completo. */
  contextoDe(planeacion: Planeacion, bloqueId: string | null): ContextoDeVerificacion {
    const secciones = this.seccionesDe(planeacion, bloqueId);
    const ids = new Set(secciones.map((s) => s.id));
    return new ContextoDeVerificacion(
      planeacion.sesiones.filter((s) => ids.has(s.seccionId)),
      secciones,
      this.plan.todas(),
      planeacion.parametros,
    );
  }

  bloque(planeacion: Planeacion, bloqueId: string): Bloque | undefined {
    return planeacion.bloques.find((b) => b.id === bloqueId);
  }

  private cambiarFranja(
    planeacion: Planeacion,
    sesionId: string,
    franja: Franja | null,
  ): Planeacion {
    const sesion = planeacion.sesiones.find((s) => s.id === sesionId);
    if (!sesion) throw new ErrorDePlaneacion(`No existe la sesión ${sesionId}`);
    const seccion = this.seccion(planeacion, sesion.seccionId);
    return this.desmarcar(
      {
        ...planeacion,
        sesiones: planeacion.sesiones.map((s) => (s.id === sesionId ? { ...s, franja } : s)),
      },
      seccion.bloqueId,
    );
  }

  private seccion(planeacion: Planeacion, seccionId: string): Seccion {
    const seccion = planeacion.secciones.find((s) => s.id === seccionId);
    if (!seccion) throw new ErrorDePlaneacion(`No existe la sección ${seccionId}`);
    return seccion;
  }

  private siguienteNumero(planeacion: Planeacion, asignaturaId: string): string {
    const usados = planeacion.secciones
      .filter((s) => s.asignaturaId === asignaturaId)
      .map((s) => Number(s.numero));
    return dosDigitos(Math.max(0, ...usados) + 1);
  }

  /** Cualquier cambio en un bloque le quita la marca de «listo para publicar». */
  private desmarcar(planeacion: Planeacion, bloqueId: string | null): Planeacion {
    if (bloqueId === null || !planeacion.bloquesMarcados.includes(bloqueId)) return planeacion;
    return {
      ...planeacion,
      bloquesMarcados: planeacion.bloquesMarcados.filter((id) => id !== bloqueId),
    };
  }
}

function dosDigitos(n: number): string {
  return n.toString().padStart(2, '0');
}
