import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.BASE_URL ?? 'https://www.centraldepasajes.com.ar';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        // false = no mostrar Navigate / Wait for selector / Before hooks técnicos.
        // Solo quedan los test.step de negocio que escribimos nosotros.
        detail: false,
        suiteTitle: true,
        environmentInfo: {
          framework: 'Playwright + TypeScript',
          base_url: baseURL,
        },
      },
    ],
    // Se mantiene HTML como respaldo; el reporte principal de UI es Allure.
    ['html', { open: 'never' }],
  ],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Screenshots de aserciones UI (OK/FAIL) se adjuntan a propósito vía uiAssertStep.
    // Playwright sigue capturando fallos genéricos automáticamente.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'ui-chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-firefox',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'ui-webkit',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'ui-mobile-chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: process.env.SWAPI_BASE_URL ?? 'https://www.swapi.tech/api',
      },
    },
  ],
});
