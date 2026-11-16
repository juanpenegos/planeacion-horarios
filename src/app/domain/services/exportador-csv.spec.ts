import { Escenario, bloqueIVCompleto } from '../testing/escenario';
import { ENCABEZADOS_CSV, ExportadorCsv } from './exportador-csv';

const exportador = new ExportadorCsv();
const BLOQUE = 'Semestre IV – sección 01';

function filas(csv: string): string[] {
  return csv.trimEnd().split('\r\n');
}

describe('ExportadorCsv (HU-06)', () => {
  it('HU-06: el bloque Semestre IV completo exporta 10 filas, una por sesión', () => {
    const csv = exportador.exportar(bloqueIVCompleto().contexto(), BLOQUE);
    const [encabezado, ...datos] = filas(csv);
    expect(encabezado).toBe(ENCABEZADOS_CSV.join(','));
    expect(encabezado).toBe('Asignatura,Sección,Bloque,Día,Hora de inicio,Hora de fin');
    expect(datos.length).toBe(10);
  });

  it('cada fila tiene asignatura, sección, bloque, día, hora de inicio y hora de fin', () => {
    const [, primera] = filas(exportador.exportar(bloqueIVCompleto().contexto(), BLOQUE));
    expect(primera).toBe('Bases de datos 1,01,Semestre IV – sección 01,Lunes,7:00,9:00');
  });

  it('no incluye sesiones pendientes', () => {
    const escenario = new Escenario(['Bases de datos 1']).programar(
      'Bases de datos 1',
      1,
      'martes',
      9,
    );
    const [, ...datos] = filas(exportador.exportar(escenario.contexto(), BLOQUE));
    expect(datos).toEqual(['Bases de datos 1,01,Semestre IV – sección 01,Martes,9:00,11:00']);
  });

  it('encierra entre comillas los valores con comas', () => {
    const csv = exportador.exportar(bloqueIVCompleto().contexto(), 'Bloque, con coma');
    expect(filas(csv)[1]).toContain('"Bloque, con coma"');
  });
});
