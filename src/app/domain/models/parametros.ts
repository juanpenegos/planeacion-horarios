/** Días en que se pueden programar sesiones. */
export const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;
export type Dia = (typeof DIAS)[number];

/** Nombre de cada día tal como se muestra al Director. */
export const NOMBRE_DIA: Readonly<Record<Dia, string>> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
};

/** Intervalo de horas en un día; las horas se expresan como número (7 = 7:00). */
export interface Intervalo {
  readonly inicio: number;
  readonly fin: number;
}

/** Valores que el Director puede cambiar sin recompilar (ENF-01). */
export interface Parametros {
  readonly horarioHabilitado: Readonly<Record<Dia, Intervalo>>;
  readonly bloqueSinClases: Intervalo;
  readonly duracionSesionHoras: number;
  readonly maximoSesionesSemana: number;
  /**
   * Cupo de referencia por sección (estudiantes). Es informativo: ninguna regla lo usa,
   * porque el producto es de oferta y no conoce la demanda.
   */
  readonly cupoPorSeccion: number;
  /** Tolerancia sobre el cupo, en porcentaje (10 = 10 %). También es informativa. */
  readonly toleranciaCupoPorcentaje: number;
}

const LUNES_A_VIERNES: Intervalo = { inicio: 7, fin: 22 };

/** Parámetros por defecto (sección 5 del documento de requisitos). */
export const PARAMETROS_POR_DEFECTO: Parametros = {
  horarioHabilitado: {
    lunes: LUNES_A_VIERNES,
    martes: LUNES_A_VIERNES,
    miercoles: LUNES_A_VIERNES,
    jueves: LUNES_A_VIERNES,
    viernes: LUNES_A_VIERNES,
    sabado: { inicio: 7, fin: 13 },
  },
  bloqueSinClases: { inicio: 12, fin: 13 },
  duracionSesionHoras: 2,
  maximoSesionesSemana: 4,
  cupoPorSeccion: 40,
  toleranciaCupoPorcentaje: 10,
};
