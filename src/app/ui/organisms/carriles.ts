/** Posición horizontal de una sesión cuando varias se solapan en el mismo día. */
export interface Carril {
  readonly carril: number;
  readonly carriles: number;
}

interface Tramo {
  readonly id: string;
  readonly inicio: number;
  readonly fin: number;
}

/**
 * Reparte las sesiones de un día en carriles para que las que se cruzan se vean
 * una al lado de la otra en lugar de taparse.
 */
export function distribuirEnCarriles(tramos: readonly Tramo[]): Map<string, Carril> {
  const resultado = new Map<string, Carril>();
  const ordenados = [...tramos].sort((a, b) => a.inicio - b.inicio || a.id.localeCompare(b.id));
  let grupo: { id: string; carril: number }[] = [];
  let finDelGrupo = -Infinity;
  let finesPorCarril: number[] = [];

  const cerrarGrupo = () => {
    for (const g of grupo) {
      resultado.set(g.id, { carril: g.carril, carriles: finesPorCarril.length });
    }
    grupo = [];
    finesPorCarril = [];
  };

  for (const tramo of ordenados) {
    if (tramo.inicio >= finDelGrupo) cerrarGrupo();
    let carril = finesPorCarril.findIndex((fin) => fin <= tramo.inicio);
    if (carril === -1) {
      carril = finesPorCarril.length;
      finesPorCarril.push(tramo.fin);
    } else {
      finesPorCarril[carril] = tramo.fin;
    }
    grupo.push({ id: tramo.id, carril });
    finDelGrupo = Math.max(finDelGrupo, tramo.fin);
  }
  cerrarGrupo();
  return resultado;
}
