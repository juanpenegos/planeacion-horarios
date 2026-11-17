import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  arrastrar,
  capturar,
  celda,
  crearBloqueIV,
  esperarResumen,
  pendiente,
  programarCon,
} from './ayudas';

/** Horario sin cruces del bloque Semestre IV (10 sesiones). */
const BLOQUE_IV: [string, string, number][] = [
  ['Bases de datos 1', 'lunes', 7],
  ['Bases de datos 1', 'miercoles', 7],
  ['Bases de datos 1', 'viernes', 7],
  ['Modelización informacional', 'lunes', 9],
  ['Modelización informacional', 'miercoles', 9],
  ['Infraestructura TI 1', 'martes', 7],
  ['Infraestructura TI 1', 'jueves', 7],
  ['Estructuras de sistemas', 'martes', 9],
  ['Estructuras de sistemas', 'jueves', 9],
  ['Proyecto núcleo 1', 'viernes', 9],
];

test('HU-01: el plan de estudios muestra 58 asignaturas, 33 programables y los créditos del PEP', async ({
  page,
}, testInfo) => {
  await page.goto('#/plan-de-estudios');
  await expect(page.getByText('58 asignaturas')).toBeVisible();
  await expect(page.getByText('33 programables')).toBeVisible();
  await expect(page.locator('app-tabla-asignaturas tbody tr')).toHaveCount(58);
  await expect(page.locator('table.creditos tbody td')).toHaveText([
    '16',
    '18',
    '16',
    '18',
    '16',
    '16',
    '16',
    '16',
    '16',
  ]);
  await capturar(page, testInfo, 'hu-01-plan-de-estudios');
});

test('HU-02: con el sábado de 7:00 a 11:00 la cuadrícula no permite programar después de las 11:00', async ({
  page,
}, testInfo) => {
  await page.goto('#/parametros');
  await page.locator('[data-campo="sabado-fin"]').fill('11');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Parámetros guardados')).toBeVisible();
  await capturar(page, testInfo, 'hu-02-parametros');

  await crearBloqueIV(page, ['Bases de datos 1']);
  await page.getByRole('link', { name: 'Planeación' }).click();
  await expect(celda(page, 'sabado', 11)).toHaveClass(/fuera-de-horario/);
  await expect(celda(page, 'sabado', 12)).toHaveClass(/fuera-de-horario/);

  // Soltar el sábado a las 10:00 no se acepta: la sesión terminaría a las 12:00.
  await arrastrar(page, pendiente(page, 'Bases de datos 1'), celda(page, 'sabado', 10));
  await expect(page.locator('app-panel-pendientes h2')).toHaveText('Sesiones pendientes (3)');
  // A las 9:00 sí cabe.
  await arrastrar(page, pendiente(page, 'Bases de datos 1'), celda(page, 'sabado', 9));
  await expect(celda(page, 'sabado', 9).locator('app-tarjeta-sesion')).toHaveCount(1);
  await capturar(page, testInfo, 'hu-02-cuadricula-sabado');
});

test('HU-03: Bases de datos 1 sección 01 en el bloque Semestre IV crea 3 sesiones pendientes', async ({
  page,
}, testInfo) => {
  const bloque = await crearBloqueIV(page, ['Bases de datos 1']);
  await expect(bloque.locator('tbody tr').first().locator('td')).toHaveText([
    'Bases de datos 1',
    '01',
    '6',
    '3',
    'Eliminar',
  ]);
  await expect(bloque.locator('option', { hasText: 'Matemáticas' })).toHaveCount(0);
  await capturar(page, testInfo, 'hu-03-secciones');

  await page.getByRole('link', { name: 'Planeación' }).click();
  await expect(page.locator('app-panel-pendientes h2')).toHaveText('Sesiones pendientes (3)');
  await expect(page.locator('app-panel-pendientes')).toContainText('sesión 1 de 3');
});

test('HU-04: arrastrar, mover y devolver una sesión', async ({ page }, testInfo) => {
  await crearBloqueIV(page, ['Bases de datos 1']);
  await page.getByRole('link', { name: 'Planeación' }).click();

  await arrastrar(page, pendiente(page, 'Bases de datos 1'), celda(page, 'martes', 9));
  const tarjeta = celda(page, 'martes', 9).locator('app-tarjeta-sesion');
  await expect(tarjeta).toHaveCount(1);
  await expect(tarjeta).toHaveAttribute('title', /martes 9:00–11:00/);
  await expect(page.locator('app-panel-pendientes h2')).toHaveText('Sesiones pendientes (2)');
  await capturar(page, testInfo, 'hu-04-programar');

  await arrastrar(page, tarjeta, celda(page, 'jueves', 14));
  await expect(celda(page, 'jueves', 14).locator('app-tarjeta-sesion')).toHaveAttribute(
    'title',
    /jueves 14:00–16:00/,
  );
  await expect(celda(page, 'martes', 9).locator('app-tarjeta-sesion')).toHaveCount(0);

  await arrastrar(
    page,
    celda(page, 'jueves', 14).locator('app-tarjeta-sesion'),
    page.locator('app-panel-pendientes ul'),
  );
  await expect(page.locator('app-panel-pendientes h2')).toHaveText('Sesiones pendientes (3)');
  await expect(page.locator('app-cuadricula-semanal app-tarjeta-sesion')).toHaveCount(0);
});

test('HU-05: el cruce del jueves muestra RN-05 con ambas asignaturas y el bloque no queda listo', async ({
  page,
}, testInfo) => {
  await crearBloqueIV(page, ['Modelización informacional', 'Infraestructura TI 1']);
  await page.getByRole('link', { name: 'Planeación' }).click();

  await arrastrar(page, pendiente(page, 'Modelización informacional'), celda(page, 'jueves', 14));
  await arrastrar(page, pendiente(page, 'Infraestructura TI 1'), celda(page, 'jueves', 15));

  const aviso = page.locator('app-fila-aviso');
  await expect(aviso).toHaveCount(1);
  await expect(aviso).toContainText(
    'RN-05 (restricción): Modelización informacional sección 01, jueves 14:00–16:00 y Infraestructura TI 1 sección 01, jueves 15:00–17:00',
  );
  await esperarResumen(page, '1 restricción incumplida · 0 advertencias · 2 sesiones pendientes');
  await expect(
    page.getByRole('button', { name: 'Marcar como listo para publicar' }),
  ).toBeDisabled();
  await expect(page.locator('app-tarjeta-sesion.restriccion')).toHaveCount(2);
  await capturar(page, testInfo, 'hu-05-verificacion');
});

test('HU-06: el bloque Semestre IV completo exporta un CSV de 10 filas', async ({
  page,
}, testInfo) => {
  await crearBloqueIV(page, 'todas');
  await page.getByRole('link', { name: 'Planeación' }).click();
  for (const [asignatura, dia, hora] of BLOQUE_IV) await programarCon(page, asignatura, dia, hora);

  await esperarResumen(
    page,
    '0 restricciones incumplidas · 0 advertencias · 0 sesiones pendientes',
  );
  await page.getByRole('button', { name: 'Marcar como listo para publicar' }).click();
  await expect(page.getByText('Bloque marcado como listo para publicar')).toBeVisible();
  await capturar(page, testInfo, 'hu-06-bloque-listo');

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar (CSV)' }).click(),
  ]);
  expect(descarga.suggestedFilename()).toBe('oferta-semestre-IV-seccion-01.csv');
  const ruta = testInfo.outputPath('oferta.csv');
  await descarga.saveAs(ruta);
  const [encabezado, ...filas] = (await readFile(ruta, 'utf8'))
    .replace(/^﻿/, '')
    .trimEnd()
    .split('\r\n');
  expect(encabezado).toBe('Asignatura,Sección,Bloque,Día,Hora de inicio,Hora de fin');
  expect(filas).toHaveLength(10);
  if (testInfo.project.name === 'chromium')
    await descarga.saveAs('docs/evidencias/hu-06-oferta-semestre-IV.csv');
});

test('ENF-05: la planeación se conserva al recargar el navegador', async ({ page }, testInfo) => {
  await crearBloqueIV(page, ['Bases de datos 1']);
  await page.getByRole('link', { name: 'Planeación' }).click();
  await arrastrar(page, pendiente(page, 'Bases de datos 1'), celda(page, 'martes', 9));
  await expect(celda(page, 'martes', 9).locator('app-tarjeta-sesion')).toHaveCount(1);

  await page.reload();
  await expect(celda(page, 'martes', 9).locator('app-tarjeta-sesion')).toHaveCount(1);
  await expect(page.locator('app-panel-pendientes h2')).toHaveText('Sesiones pendientes (2)');
  await capturar(page, testInfo, 'enf-05-persistencia');
});

test('ENF-02: cada verificación tras 10 movimientos en el bloque IV tarda 1 s o menos', async ({
  page,
}, testInfo) => {
  await crearBloqueIV(page, 'todas');
  await page.getByRole('link', { name: 'Planeación' }).click();
  const tiempos: number[] = [];
  let pendientes = 10;
  for (const [asignatura, dia, hora] of BLOQUE_IV) {
    const chip = pendiente(page, asignatura);
    await chip.locator('summary').click();
    const [selectDia, selectHora] = await chip.locator('select').all();
    await selectDia.selectOption(dia);
    await selectHora.selectOption(String(hora));
    // Desde el clic hasta que la cuadrícula y la verificación muestran el cambio.
    const inicio = Date.now();
    await chip.getByRole('button', { name: 'Programar' }).click();
    pendientes--;
    await expect(page.locator('app-panel-verificacion .cifras')).toContainText(
      `${pendientes} ${pendientes === 1 ? 'sesión pendiente' : 'sesiones pendientes'}`,
    );
    tiempos.push(Date.now() - inicio);
  }
  const maximo = Math.max(...tiempos);
  testInfo.annotations.push({
    type: 'ENF-02',
    description: `Tiempo máximo de un movimiento con su verificación: ${maximo} ms`,
  });
  expect(tiempos).toHaveLength(10);
  expect(maximo).toBeLessThanOrEqual(1000);
});

test('HU-02: el cupo de referencia (35 + 20 %) se guarda, se calcula y se conserva al recargar', async ({
  page,
}, testInfo) => {
  await page.goto('#/parametros');
  const resultado = page.locator('[data-campo="cupo-maximo"] [aria-hidden="true"]');
  await expect(resultado).toHaveText('Cupo máximo por sección: 44 estudiantes (40 + 10 %)');

  await page.getByLabel('Cupo por sección (estudiantes)').fill('35');
  await page.getByLabel('Tolerancia del cupo (%)').fill('20');
  await expect(resultado).toHaveText('Cupo máximo por sección: 42 estudiantes (35 + 20 %)');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Parámetros guardados')).toBeVisible();
  await capturar(page, testInfo, 'hu-02-cupo');

  await page.reload();
  await expect(page.getByLabel('Cupo por sección (estudiantes)')).toHaveValue('35');
  await expect(page.getByLabel('Tolerancia del cupo (%)')).toHaveValue('20');
  await expect(resultado).toHaveText('Cupo máximo por sección: 42 estudiantes (35 + 20 %)');

  await page.getByRole('link', { name: 'Planeación' }).click();
  const panel = page.locator('app-panel-parametros');
  await expect(panel.locator('.fila', { hasText: 'Cupo por sección' }).locator('dd')).toHaveText(
    '35 estudiantes',
  );
  await expect(panel.locator('.fila', { hasText: 'Tolerancia del cupo' }).locator('dd')).toHaveText(
    '20 %',
  );
});
