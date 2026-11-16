import { Locator, Page, TestInfo, expect } from '@playwright/test';

/** Guarda la captura de una historia en docs/evidencias (solo en Chrome, para no duplicar). */
export async function capturar(page: Page, testInfo: TestInfo, nombre: string): Promise<void> {
  if (testInfo.project.name !== 'chromium') return;
  await page.screenshot({ path: `docs/evidencias/${nombre}.png`, fullPage: true });
}

/** Crea el bloque Semestre IV y las secciones indicadas desde la página Secciones. */
export async function crearBloqueIV(page: Page, asignaturas: string[] | 'todas'): Promise<Locator> {
  await page.goto('#/secciones');
  await page.locator('.nuevo-bloque select').selectOption('IV');
  await page.getByRole('button', { name: 'Crear bloque' }).click();
  const bloque = page.locator('[data-grupo="IV-01"]');
  if (asignaturas === 'todas') {
    await bloque.getByRole('button', { name: 'Crear una sección de cada asignatura' }).click();
  } else {
    for (const nombre of asignaturas) {
      const valor = await bloque
        .locator('option', { hasText: `${nombre} (` })
        .getAttribute('value');
      await bloque.locator('select').selectOption(valor!);
      await bloque.getByRole('button', { name: 'Crear sección' }).click();
    }
  }
  return bloque;
}

/** Arrastra con el ratón, paso a paso, como lo haría el Director. */
export async function arrastrar(page: Page, origen: Locator, destino: Locator): Promise<void> {
  // Se desplaza antes de empezar: mover la página a mitad del arrastre cambia las posiciones.
  await destino.scrollIntoViewIfNeeded();
  await origen.scrollIntoViewIfNeeded();
  const a = await origen.boundingBox();
  if (!a) throw new Error('No se encontró el elemento a arrastrar');
  await page.mouse.move(a.x + 20, a.y + 10);
  await page.mouse.down();
  await page.mouse.move(a.x + 30, a.y + 20, { steps: 5 });
  const b = await destino.boundingBox();
  if (!b) throw new Error('No se encontró el destino');
  await page.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height / 2, 12), { steps: 15 });
  await page.mouse.up();
}

export function celda(page: Page, dia: string, hora: number): Locator {
  return page.locator(`[data-franja="${dia}-${hora}"]`);
}

/** Primer chip pendiente de una asignatura. */
export function pendiente(page: Page, asignatura: string): Locator {
  return page.locator('app-panel-pendientes li', { hasText: asignatura }).first();
}

/** Programa la primera sesión pendiente de la asignatura con «Programar en…». */
export async function programarCon(
  page: Page,
  asignatura: string,
  dia: string,
  hora: number,
): Promise<void> {
  const chip = pendiente(page, asignatura);
  await chip.locator('summary').click();
  const [selectDia, selectHora] = await chip.locator('select').all();
  await selectDia.selectOption(dia);
  await selectHora.selectOption(String(hora));
  await chip.getByRole('button', { name: 'Programar' }).click();
}

export async function esperarResumen(page: Page, texto: string): Promise<void> {
  await expect(page.locator('app-panel-verificacion .cifras')).toHaveText(texto);
}
