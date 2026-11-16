import { InjectionToken, inject } from '@angular/core';
import { ArchivoDePlaneacion } from '../data/archivo-de-planeacion';
import { AsignaturasRepository } from '../data/asignaturas.repository';
import { crearRegistroDelDominio } from '../domain/rules/registro-de-reglas';
import { EditorDePlaneacion } from '../domain/services/editor-de-planeacion';
import { ExportadorCsv } from '../domain/services/exportador-csv';
import { PlanDeEstudios } from '../domain/services/plan-de-estudios';
import { ResumenDeBloque } from '../domain/services/resumen-de-bloque';
import { Verificador } from '../domain/services/verificador';

/*
 * Los servicios del dominio son TypeScript puro (no dependen de Angular). Estos tokens
 * los entregan por inyección de dependencias: quien los usa no los construye, y una
 * prueba o una versión futura puede reemplazarlos sin tocar el código que los consume.
 */

export const PLAN_DE_ESTUDIOS = new InjectionToken<PlanDeEstudios>('PlanDeEstudios', {
  providedIn: 'root',
  factory: () => new PlanDeEstudios(inject(AsignaturasRepository).todas()),
});

export const EDITOR_DE_PLANEACION = new InjectionToken<EditorDePlaneacion>('EditorDePlaneacion', {
  providedIn: 'root',
  factory: () => new EditorDePlaneacion(inject(PLAN_DE_ESTUDIOS)),
});

export const VERIFICADOR = new InjectionToken<Verificador>('Verificador', {
  providedIn: 'root',
  factory: () => new Verificador(crearRegistroDelDominio()),
});

export const RESUMEN_DE_BLOQUE = new InjectionToken<ResumenDeBloque>('ResumenDeBloque', {
  providedIn: 'root',
  factory: () => new ResumenDeBloque(),
});

export const EXPORTADOR_CSV = new InjectionToken<ExportadorCsv>('ExportadorCsv', {
  providedIn: 'root',
  factory: () => new ExportadorCsv(),
});

export const ARCHIVO_DE_PLANEACION = new InjectionToken<ArchivoDePlaneacion>(
  'ArchivoDePlaneacion',
  { providedIn: 'root', factory: () => new ArchivoDePlaneacion() },
);
