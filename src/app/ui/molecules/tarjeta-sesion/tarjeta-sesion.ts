import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TEXTO_ESTADO, VistaDeSesion } from '../../vista-de-sesion';

/** Sesión programada dentro de la cuadrícula, coloreada según su estado y con texto. */
@Component({
  selector: 'app-tarjeta-sesion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'sesion().estado', '[attr.title]': 'descripcion()' },
  templateUrl: './tarjeta-sesion.html',
  styleUrl: './tarjeta-sesion.css',
})
export class TarjetaSesion {
  readonly sesion = input.required<VistaDeSesion>();
  readonly estado = computed(() => TEXTO_ESTADO[this.sesion().estado]);
  readonly descripcion = computed(() => {
    const s = this.sesion();
    return `${s.asignatura} sección ${s.seccion}, sesión ${s.numero} de ${s.total}${s.franja ? `, ${s.franja}` : ''}: ${this.estado().texto}`;
  });
}
