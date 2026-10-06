import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { resolveEnvironment } from './src/config/resolve-environment';

dotenv.config();

const environment = resolveEnvironment();
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
        detail: false,
        suiteTitle: true,
        environmentInfo: {
          framework: 'Playwright + TypeScript',
          test_env: environment.name,
          ui_base_url: environment.uiBaseUrl,
          api_base_url: environment.apiBaseUrl,
          is_live: String(environment.isLive),
        },
      },
    ],
    ['html', { open: 'never' }],
  ],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: environment.uiBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'config',
      testMatch: /tests\/config\/.*\.spec\.ts/,
    },
    {
      name: 'ui-chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: environment.uiBaseUrl },
    },
    {
      name: 'ui-firefox',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], baseURL: environment.uiBaseUrl },
    },
    {
      name: 'ui-webkit',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'], baseURL: environment.uiBaseUrl },
    },
    {
      name: 'ui-mobile-chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Pixel 5'], baseURL: environment.uiBaseUrl },
    },
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: environment.apiBaseUrl,
      },
    },
  ],
});
