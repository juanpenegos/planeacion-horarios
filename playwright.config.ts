import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de punta a punta en Chrome y Firefox (ENF-04). Las capturas de pantalla
 * y el reporte quedan en docs/evidencias para el informe final.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'docs/evidencias/reporte-e2e', open: 'never' }],
    ['junit', { outputFile: 'docs/evidencias/resultados-e2e.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:4300/',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npx ng serve --port 4300',
    url: 'http://localhost:4300/',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
