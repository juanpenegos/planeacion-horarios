import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Encabezado institucional con el título y la navegación entre páginas. */
@Component({
  selector: 'app-encabezado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div>
        <h1>Planeación de horarios de secciones</h1>
        <p>Programa de Ingeniería de Sistemas · Datos reales: plan de estudios PEP 2025</p>
      </div>
      <nav aria-label="Páginas">
        @for (enlace of enlaces; track enlace.ruta) {
          <a [routerLink]="enlace.ruta" routerLinkActive="activo" ariaCurrentWhenActive="page">{{
            enlace.texto
          }}</a>
        }
      </nav>
    </header>
  `,
  styles: `
    header {
      background: var(--color-vino);
      color: var(--color-texto-encabezado);
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      align-items: center;
      justify-content: space-between;
    }
    h1 {
      font-size: 18px;
    }
    p {
      margin: 2px 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    a {
      color: inherit;
      text-decoration: none;
      padding: 6px 10px;
      border-radius: 4px;
    }
    a:hover {
      background: rgb(255 255 255 / 12%);
    }
    a.activo {
      background: rgb(255 255 255 / 22%);
      font-weight: bold;
    }
    a:focus-visible {
      outline-color: #fff;
    }
  `,
})
export class Encabezado {
  readonly enlaces = [
    { ruta: '/planeacion', texto: 'Planeación' },
    { ruta: '/plan-de-estudios', texto: 'Plan de estudios' },
    { ruta: '/secciones', texto: 'Secciones' },
    { ruta: '/parametros', texto: 'Parámetros' },
  ];
}
