import { PARAMETROS_POR_DEFECTO, Planeacion, estaPendiente, planeacionVacia } from '../models';
import { ASIGNATURAS, asignaturaPorNombre } from '../testing/escenario';
import { EditorDePlaneacion } from './editor-de-planeacion';
import { PlanDeEstudios } from './plan-de-estudios';
import { ResumenDeBloque } from './resumen-de-bloque';

const editor = new EditorDePlaneacion(new PlanDeEstudios(ASIGNATURAS));
const BD1 = asignaturaPorNombre('Bases de datos 1');

function conBloqueIV(): Planeacion {
  return editor.crearBloque(planeacionVacia(), 'IV');
}

describe('EditorDePlaneacion', () => {
  it('crea bloques numerados por semestre (IV-01, IV-02)', () => {
    const p = editor.crearBloque(conBloqueIV(), 'IV');
    expect(p.bloques.map((b) => b.id)).toEqual(['IV-01', 'IV-02']);
  });

  it('no crea bloques del semestre IX, que no tiene asignaturas en bloque', () => {
    expect(() => editor.crearBloque(planeacionVacia(), 'IX')).toThrow();
  });

  it('HU-03: Bases de datos 1 sección 01 en el bloque Semestre IV aparece con 3 sesiones pendientes', () => {
    const p = editor.crearSeccion(conBloqueIV(), BD1.id, 'IV-01');
    expect(p.secciones).toEqual([
      { id: `${BD1.id}-01`, asignaturaId: BD1.id, numero: '01', bloqueId: 'IV-01' },
    ]);
    expect(p.sesiones.length).toBe(3);
    expect(p.sesiones.every(estaPendiente)).toBe(true);
  });

  it('HU-03: no permite crear secciones de asignaturas no programables', () => {
    const matematicas = asignaturaPorNombre('Matemáticas 1');
    expect(() => editor.crearSeccion(conBloqueIV(), matematicas.id, 'IV-01')).toThrow(
      'Solo se pueden crear secciones de asignaturas programables',
    );
  });

  it('no permite poner una asignatura en el bloque de otro semestre', () => {
    const p = editor.crearBloque(planeacionVacia(), 'VI');
    expect(() => editor.crearSeccion(p, BD1.id, 'VI-01')).toThrow(
      'Bases de datos 1 debe ir en un bloque del Semestre IV',
    );
  });

  it('las asignaturas fuera de bloque se crean sin bloque', () => {
    const tg = asignaturaPorNombre('Trabajo de grado');
    const p = editor.crearSeccion(planeacionVacia(), tg.id, null);
    expect(p.secciones[0].bloqueId).toBeNull();
    expect(() => editor.crearSeccion(conBloqueIV(), tg.id, 'IV-01')).toThrow();
  });

  it('numera la segunda sección de la asignatura como 02 en otro bloque', () => {
    let p = editor.crearBloque(conBloqueIV(), 'IV');
    p = editor.crearSeccion(p, BD1.id, 'IV-01');
    p = editor.crearSeccion(p, BD1.id, 'IV-02');
    expect(p.secciones.map((s) => s.numero)).toEqual(['01', '02']);
    expect(() => editor.crearSeccion(p, BD1.id, 'IV-01')).toThrow();
  });

  it('programa, mueve y devuelve una sesión (HU-04)', () => {
    let p = editor.crearSeccion(conBloqueIV(), BD1.id, 'IV-01');
    const id = p.sesiones[0].id;
    p = editor.programar(p, id, { dia: 'martes', horaInicio: 9 });
    expect(p.sesiones[0].franja).toEqual({ dia: 'martes', horaInicio: 9 });
    p = editor.programar(p, id, { dia: 'jueves', horaInicio: 14 });
    expect(p.sesiones[0].franja).toEqual({ dia: 'jueves', horaInicio: 14 });
    p = editor.devolver(p, id);
    expect(estaPendiente(p.sesiones[0])).toBe(true);
  });

  it('elimina una sección con sus sesiones', () => {
    let p = editor.crearSeccion(conBloqueIV(), BD1.id, 'IV-01');
    p = editor.eliminarSeccion(p, p.secciones[0].id);
    expect(p.secciones).toEqual([]);
    expect(p.sesiones).toEqual([]);
  });

  it('si cambia la duración a 3 h, Bases de datos 1 pasa a 2 sesiones y conserva la primera', () => {
    let p = editor.crearSeccion(conBloqueIV(), BD1.id, 'IV-01');
    p = editor.programar(p, p.sesiones[0].id, { dia: 'lunes', horaInicio: 7 });
    p = editor.cambiarParametros(p, { ...PARAMETROS_POR_DEFECTO, duracionSesionHoras: 3 });
    expect(p.sesiones.length).toBe(2);
    expect(p.sesiones[0].franja).toEqual({ dia: 'lunes', horaInicio: 7 });
  });

  it('marca como listo solo si el resumen lo permite, y un cambio en el bloque quita la marca', () => {
    const resumen = new ResumenDeBloque();
    let p = editor.crearSeccion(conBloqueIV(), BD1.id, 'IV-01');
    expect(() => editor.marcarListo(p, 'IV-01', resumen.resumir(p.sesiones, []))).toThrow();
    p.sesiones.forEach((s, i) => {
      p = editor.programar(p, s.id, {
        dia: (['lunes', 'miercoles', 'viernes'] as const)[i],
        horaInicio: 7,
      });
    });
    p = editor.marcarListo(p, 'IV-01', resumen.resumir(p.sesiones, []));
    expect(p.bloquesMarcados).toEqual(['IV-01']);
    p = editor.devolver(p, p.sesiones[0].id);
    expect(p.bloquesMarcados).toEqual([]);
  });

  it('el contexto de un bloque solo incluye sus secciones', () => {
    let p = editor.crearBloque(conBloqueIV(), 'VI');
    p = editor.crearSeccion(p, BD1.id, 'IV-01');
    p = editor.crearSeccion(p, asignaturaPorNombre('Complejidad algorítmica').id, 'VI-01');
    const contexto = editor.contextoDe(p, 'IV-01');
    expect(contexto.secciones.length).toBe(1);
    expect(contexto.sesiones.length).toBe(3);
  });
});
