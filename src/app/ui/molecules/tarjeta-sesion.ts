import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TEXTO_ESTADO, VistaDeSesion } from '../vista-de-sesion';

/** Sesión programada dentro de la cuadrícula, coloreada según su estado y con texto. */
@Component({
  selector: 'app-tarjeta-sesion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'sesion().estado', '[attr.title]': 'descripcion()' },
  template: `
    <span class="asignatura">{{ sesion().asignatura }}</span>
    <span class="detalle"
      >Sección {{ sesion().seccion }} · sesión {{ sesion().numero }} de {{ sesion().total }}</span
    >
    <span class="estado"
      ><span aria-hidden="true">{{ estado().simbolo }}</span> {{ estado().texto }}</span
    >
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1px;
      height: 100%;
      padding: 4px 6px;
      border: 1px solid var(--correcta-borde);
      border-left-width: 4px;
      border-radius: var(--chip-radio);
      background: var(--correcta-fondo);
      font-size: 11px;
      overflow: hidden;
      cursor: grab;
    }
    :host(.restriccion) {
      background: var(--restriccion-fondo);
      border-color: var(--restriccion-borde);
    }
    :host(.advertencia) {
      background: var(--advertencia-fondo);
      border-color: var(--advertencia-borde);
    }
    :host(.pendiente) {
      background: var(--pendiente-fondo);
      border-color: var(--pendiente-borde);
    }
    .asignatura {
      font-weight: bold;
      font-size: 12px;
    }
    .estado {
      margin-top: auto;
    }
  `,
})
export class TarjetaSesion {
  readonly sesion = input.required<VistaDeSesion>();
  readonly estado = computed(() => TEXTO_ESTADO[this.sesion().estado]);
  readonly descripcion = computed(() => {
    const s = this.sesion();
    return `${s.asignatura} sección ${s.seccion}, sesión ${s.numero} de ${s.total}${s.franja ? `, ${s.franja}` : ''}: ${this.estado().texto}`;
  });
}
