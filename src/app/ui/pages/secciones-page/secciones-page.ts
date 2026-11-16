import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ErrorDePlaneacion, SEMESTRES_CON_BLOQUE, Semestre } from '../../../domain/models';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { Boton } from '../../atoms/boton/boton';
import { GrupoDeSeccionesComponent } from '../../organisms/grupo-de-secciones/grupo-de-secciones';
import { PlantillaUnaColumna } from '../../templates/plantilla-una-columna/plantilla-una-columna';

/** Definición de bloques de semestre y de las secciones que se abren (HU-03). */
@Component({
  selector: 'app-secciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlantillaUnaColumna, Boton, GrupoDeSeccionesComponent],
  templateUrl: './secciones-page.html',
  styleUrl: './secciones-page.css',
})
export class SeccionesPage {
  readonly store = inject(PlaneacionStore);
  readonly semestres = SEMESTRES_CON_BLOQUE;
  readonly error = signal<string | null>(null);

  crearBloque(semestre: string): void {
    this.intentar(() => this.store.crearBloque(semestre as Semestre));
  }

  crearSeccion(asignaturaId: string, bloqueId: string | null): void {
    this.intentar(() => this.store.crearSeccion(asignaturaId, bloqueId));
  }

  crearTodas(bloqueId: string | null): void {
    if (bloqueId !== null) this.intentar(() => this.store.crearSeccionesDelBloque(bloqueId));
  }

  eliminarSeccion(seccionId: string): void {
    this.intentar(() => this.store.eliminarSeccion(seccionId));
  }

  eliminarBloque(bloqueId: string | null): void {
    if (bloqueId !== null) this.intentar(() => this.store.eliminarBloque(bloqueId));
  }

  /** Muestra al Director el motivo si la operación no se permite. */
  private intentar(operacion: () => void): void {
    try {
      operacion();
      this.error.set(null);
    } catch (e) {
      if (!(e instanceof ErrorDePlaneacion)) throw e;
      this.error.set(e.message);
    }
  }
}
