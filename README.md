# Planeación de horarios de secciones

Aplicación web para que el Director del Programa de Ingeniería de Sistemas de la Universidad El Bosque planee el horario semanal de las secciones de cada bloque de semestre, con los datos reales del plan de estudios PEP 2025.

**Aplicación publicada:** https://juanpenegos.github.io/planeacion-horarios/

## Qué permite hacer

| Historia | Qué hace |
| --- | --- |
| HU-01 | Consultar el plan de estudios: 58 asignaturas, 33 programables y créditos por semestre. |
| HU-02 | Configurar los parámetros: horario habilitado por día, bloque sin clases, duración de la sesión, máximo de sesiones semanales y el cupo de referencia (cupo por sección y tolerancia). |
| HU-03 | Crear bloques de semestre y secciones; cada sección genera sus sesiones pendientes. |
| HU-04 | Programar, mover y devolver sesiones arrastrándolas en la cuadrícula semanal (o con «Programar en…» desde el teclado). |
| HU-05 | Ver al instante las restricciones (RN-01 a RN-05) y advertencias (RA-01) incumplidas. |
| HU-06 | Marcar un bloque como listo para publicar y exportar su oferta en CSV. |

La planeación se guarda en el navegador y puede exportarse o importarse como JSON desde la página Parámetros.

### Cupo de referencia

El cupo por sección (por defecto 40 estudiantes) y su tolerancia (por defecto 10 %) son parámetros editables. La página Parámetros muestra el cupo máximo resultante, redondeado hacia abajo: «Cupo máximo por sección: 44 estudiantes (40 + 10 %)». Son **informativos**: ninguna regla los usa, porque la planeación es de oferta y no conoce la demanda. Las planeaciones y archivos JSON guardados antes de este cambio se cargan sin problema y toman los valores por defecto.

## Reglas verificadas

- **RN-01** Cada sesión debe estar dentro del horario habilitado del día.
- **RN-02** Ninguna sesión puede ocupar el bloque sin clases (12:00 a 13:00).
- **RN-03** Cada sección debe tener el número de sesiones que le corresponde.
- **RN-04** Las sesiones de una misma sección no pueden cruzarse.
- **RN-05** Las sesiones de un mismo bloque de semestre no pueden cruzarse.
- **RA-01** Advertencia: una asignatura no debería tener sesiones en días consecutivos.

## Tecnología

Angular (componentes standalone, signals, detección de cambios OnPush), `@angular/cdk/drag-drop`, almacenamiento en `localStorage` detrás de una interfaz, rutas con hash, CSS propio basado en tokens (`src/styles/tokens.css`), ESLint y Prettier, Vitest para pruebas unitarias y Playwright para pruebas de punta a punta.

### Estructura

```
src/app/
  domain/   modelos, reglas (una clase por regla) y servicios, en TypeScript puro
  data/     repositorios (plan de estudios, planeación), importación/exportación y descargas
  state/    store de la planeación con signals, servicio de exportación e importación
            y tokens de inyección de los servicios del dominio
  ui/       átomos, moléculas, organismos, plantillas (tres columnas y una columna) y páginas
            (cada componente con .ts, .html y .css)
e2e/        pruebas de punta a punta por historia de usuario
docs/evidencias/  capturas, reportes de pruebas y CSV exportado
```

## Cómo ejecutarlo

Requisitos: Node.js 22 o superior.

```bash
npm install
npm start
```

Luego abrir http://localhost:4200/.

## Cómo probarlo

```bash
npm test             # pruebas unitarias (Vitest)
npm run lint         # ESLint
npm run format:check # Prettier
npx playwright install chromium firefox   # solo la primera vez
npm run e2e          # pruebas de punta a punta en Chrome y Firefox
npm run evidencias   # regenera los reportes y capturas de docs/evidencias
```

## Publicación

Cada cambio en la rama `main` ejecuta el flujo de GitHub Actions `.github/workflows/despliegue.yml`: lint, formato, pruebas unitarias, compilación con `--base-href /planeacion-horarios/` y publicación en GitHub Pages.

## Evidencias

En `docs/evidencias/` están:

- una captura por historia de usuario (`hu-01` a `hu-06`, más `hu-02-cupo`) y de la persistencia (`enf-05`);
- `hu-06-oferta-semestre-IV.csv`, la oferta exportada del bloque Semestre IV;
- `reporte-e2e/` (reporte HTML de Playwright) y `resultados-e2e.xml`;
- `resultados-pruebas-unitarias.txt`;
- `enlace-publico.md`, con la dirección de la aplicación publicada.
