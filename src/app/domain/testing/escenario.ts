import datos from '../../../assets/data/asignaturas.json';
import {
  Asignatura,
  Dia,
  PARAMETROS_POR_DEFECTO,
  Parametros,
  Seccion,
  Sesion,
  crearBloque,
} from '../models';
import { ContextoDeVerificacion } from '../rules/contexto-de-verificacion';
import { GeneradorDeSesiones } from '../services/generador-de-sesiones';

/** Asignaturas reales del PEP 2025 para las pruebas. */
export const ASIGNATURAS = datos as Asignatura[];

export function asignaturaPorNombre(nombre: string): Asignatura {
  const asignatura = ASIGNATURAS.find((a) => a.nombre === nombre);
  if (!asignatura) throw new Error(`No existe la asignatura ${nombre}`);
  return asignatura;
}

/** Asignaturas del bloque Semestre IV (5 asignaturas, 10 sesiones). */
export const BLOQUE_IV = [
  'Bases de datos 1',
  'Modelización informacional',
  'Infraestructura TI 1',
  'Estructuras de sistemas',
  'Proyecto núcleo 1',
] as const;

/** Programa las 10 sesiones del bloque IV sin restricciones ni advertencias. */
export function bloqueIVCompleto(): Escenario {
  return new Escenario(BLOQUE_IV)
    .programar('Bases de datos 1', 1, 'lunes', 7)
    .programar('Bases de datos 1', 2, 'miercoles', 7)
    .programar('Bases de datos 1', 3, 'viernes', 7)
    .programar('Modelización informacional', 1, 'lunes', 9)
    .programar('Modelización informacional', 2, 'miercoles', 9)
    .programar('Infraestructura TI 1', 1, 'martes', 7)
    .programar('Infraestructura TI 1', 2, 'jueves', 7)
    .programar('Estructuras de sistemas', 1, 'martes', 9)
    .programar('Estructuras de sistemas', 2, 'jueves', 9)
    .programar('Proyecto núcleo 1', 1, 'viernes', 9);
}

/**
 * Ayuda de pruebas: crea la sección 01 de cada asignatura indicada (en el bloque
 * de su semestre, o sin bloque si es fuera de bloque) y permite programar sesiones.
 */
export class Escenario {
  readonly secciones: Seccion[];
  private sesiones: Sesion[];

  constructor(
    nombres: readonly string[],
    readonly parametros: Parametros = PARAMETROS_POR_DEFECTO,
  ) {
    const generador = new GeneradorDeSesiones();
    this.secciones = nombres.map((nombre) => {
      const a = asignaturaPorNombre(nombre);
      return {
        id: `${a.id}-01`,
        asignaturaId: a.id,
        numero: '01',
        bloqueId: a.alcance === 'bloque' ? crearBloque(a.semestre, '01').id : null,
      };
    });
    this.sesiones = this.secciones.flatMap((seccion) =>
      generador.generar(seccion, asignaturaPorNombre(this.nombreDe(seccion)), parametros),
    );
  }

  sesion(nombre: string, numero: number): Sesion {
    const id = `${asignaturaPorNombre(nombre).id}-01-s${numero}`;
    const sesion = this.sesiones.find((s) => s.id === id);
    if (!sesion) throw new Error(`No existe la sesión ${numero} de ${nombre}`);
    return sesion;
  }

  programar(nombre: string, numero: number, dia: Dia, horaInicio: number): this {
    const id = this.sesion(nombre, numero).id;
    this.sesiones = this.sesiones.map((s) =>
      s.id === id ? { ...s, franja: { dia, horaInicio } } : s,
    );
    return this;
  }

  /** Reemplaza las sesiones (para probar RN-03 con secciones incompletas o sobrantes). */
  conSesiones(sesiones: Sesion[]): this {
    this.sesiones = sesiones;
    return this;
  }

  todasLasSesiones(): Sesion[] {
    return this.sesiones;
  }

  contexto(): ContextoDeVerificacion {
    return new ContextoDeVerificacion(this.sesiones, this.secciones, ASIGNATURAS, this.parametros);
  }

  private nombreDe(seccion: Seccion): string {
    return ASIGNATURAS.find((a) => a.id === seccion.asignaturaId)!.nombre;
  }
}
