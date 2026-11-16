import { Injectable } from '@angular/core';

/** Entrega un archivo al navegador para que el Director lo guarde. */
@Injectable({ providedIn: 'root' })
export class Descargador {
  descargar(nombre: string, contenido: string, tipo: string): void {
    // El BOM hace que Excel lea bien las tildes del CSV.
    const datos = tipo.startsWith('text/csv') ? '﻿' + contenido : contenido;
    const url = URL.createObjectURL(new Blob([datos], { type: tipo }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }
}
