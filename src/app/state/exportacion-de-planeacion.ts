import { Injectable, inject } from '@angular/core';
import { Descargador } from '../data/descargador';
import { nombreDeBloque } from '../domain/models';
import { PlaneacionStore } from './planeacion.store';
import { ARCHIVO_DE_PLANEACION, EXPORTADOR_CSV } from './servicios-del-dominio';

/** Archivo listo para entregarse al Director. */
export interface Archivo {
  readonly nombre: string;
  readonly contenido: string;
  readonly tipo: string;
}

/**
 * Exportación e importación de la planeación: la oferta del bloque en CSV (HU-06) y la
 * copia completa en JSON (ENF-05). Está separada del almacén, que solo maneja el estado.
 */
@Injectable({ providedIn: 'root' })
export class ExportacionDePlaneacion {
  private readonly store = inject(PlaneacionStore);
  private readonly descargador = inject(Descargador);
  private readonly exportadorCsv = inject(EXPORTADOR_CSV);
  private readonly archivo = inject(ARCHIVO_DE_PLANEACION);

  /** CSV de la oferta del bloque seleccionado, o nulo si no está listo para publicar. */
  csvDelBloque(): Archivo | null {
    const bloque = this.store.bloqueSeleccionado();
    if (!bloque || !this.store.resumen().listoParaPublicar) return null;
    return {
      nombre: `oferta-semestre-${bloque.semestre}-seccion-${bloque.numero}.csv`,
      contenido: this.exportadorCsv.exportar(this.store.contextoDelGrupo(), nombreDeBloque(bloque)),
      tipo: 'text/csv;charset=utf-8',
    };
  }

  /** Descarga el CSV del bloque; devuelve falso si el bloque no está listo. */
  descargarCsv(): boolean {
    const archivo = this.csvDelBloque();
    if (!archivo) return false;
    this.descargador.descargar(archivo.nombre, archivo.contenido, archivo.tipo);
    return true;
  }

  /** Copia completa de la planeación en JSON. */
  json(): Archivo {
    return {
      nombre: 'planeacion.json',
      contenido: this.archivo.exportar(this.store.planeacion()),
      tipo: 'application/json',
    };
  }

  descargarJson(): void {
    const archivo = this.json();
    this.descargador.descargar(archivo.nombre, archivo.contenido, archivo.tipo);
  }

  /** Reemplaza la planeación por la del archivo; lanza ErrorDePlaneacion si no es válido. */
  importarJson(texto: string): void {
    this.store.reemplazar(this.archivo.importar(texto));
  }
}
