import { test, expect } from '@playwright/test';
import { ENVIRONMENT_CATALOG } from '../../src/config/environments';
import { resolveEnvironment } from '../../src/config/resolve-environment';
import { ENVIRONMENT_NAMES } from '../../src/config/environment.types';

test.describe('Configuración multi-ambiente', () => {
  test('prod (default) resuelve URLs live del challenge', async () => {
    const config = resolveEnvironment({ TEST_ENV: 'prod' });

    expect(config.name).toBe('prod');
    expect(config.isLive).toBe(true);
    expect(config.uiBaseUrl).toBe(ENVIRONMENT_CATALOG.prod.uiBaseUrl);
    expect(config.apiBaseUrl).toBe(ENVIRONMENT_CATALOG.prod.apiBaseUrl);
  });

  test('TEST_ENV=qa selecciona catálogo QA (placeholder, no live)', async () => {
    const config = resolveEnvironment({ TEST_ENV: 'qa' });

    expect(config.name).toBe('qa');
    expect(config.displayName).toBe('QA');
    expect(config.isLive).toBe(false);
    expect(config.uiBaseUrl).toBe(ENVIRONMENT_CATALOG.qa.uiBaseUrl);
    expect(config.apiBaseUrl).toBe(ENVIRONMENT_CATALOG.qa.apiBaseUrl);
  });

  test('TEST_ENV=dev selecciona catálogo DEV (placeholder, no live)', async () => {
    const config = resolveEnvironment({ TEST_ENV: 'dev' });

    expect(config.name).toBe('dev');
    expect(config.displayName).toBe('Development');
    expect(config.isLive).toBe(false);
    expect(config.uiBaseUrl).toBe(ENVIRONMENT_CATALOG.dev.uiBaseUrl);
    expect(config.apiBaseUrl).toBe(ENVIRONMENT_CATALOG.dev.apiBaseUrl);
  });

  test('alias ENV=qa funciona igual que TEST_ENV', async () => {
    const config = resolveEnvironment({ ENV: 'qa' });
    expect(config.name).toBe('qa');
  });

  test('overrides UI_BASE_URL/API_BASE_URL marcan el ambiente como live', async () => {
    const config = resolveEnvironment({
      TEST_ENV: 'qa',
      UI_BASE_URL: 'https://qa.real.example',
      API_BASE_URL: 'https://api.qa.real.example',
      API_MAX_RESPONSE_MS: '8000',
    });

    expect(config.name).toBe('qa');
    expect(config.uiBaseUrl).toBe('https://qa.real.example');
    expect(config.apiBaseUrl).toBe('https://api.qa.real.example');
    expect(config.apiMaxResponseMs).toBe(8000);
    expect(config.isLive).toBe(true);
  });

  test('overrides por prefijo QA_UI_BASE_URL ganan sobre genéricos', async () => {
    const config = resolveEnvironment({
      TEST_ENV: 'qa',
      UI_BASE_URL: 'https://generic.example',
      QA_UI_BASE_URL: 'https://qa-specific.example',
      QA_API_BASE_URL: 'https://qa-api-specific.example',
    });

    expect(config.uiBaseUrl).toBe('https://qa-specific.example');
    expect(config.apiBaseUrl).toBe('https://qa-api-specific.example');
    expect(config.isLive).toBe(true);
  });

  test('legacy BASE_URL / SWAPI_BASE_URL solo aplican en prod', async () => {
    const prod = resolveEnvironment({
      TEST_ENV: 'prod',
      BASE_URL: 'https://legacy-ui.example',
      SWAPI_BASE_URL: 'https://legacy-api.example',
    });
    expect(prod.uiBaseUrl).toBe('https://legacy-ui.example');
    expect(prod.apiBaseUrl).toBe('https://legacy-api.example');

    const qa = resolveEnvironment({
      TEST_ENV: 'qa',
      BASE_URL: 'https://legacy-ui.example',
      SWAPI_BASE_URL: 'https://legacy-api.example',
    });
    expect(qa.uiBaseUrl).toBe(ENVIRONMENT_CATALOG.qa.uiBaseUrl);
    expect(qa.isLive).toBe(false);
  });

  test('secrets vacíos en CI no pisan el catálogo ni marcan live', async () => {
    const config = resolveEnvironment({
      TEST_ENV: 'qa',
      UI_BASE_URL: '',
      API_BASE_URL: '   ',
      QA_UI_BASE_URL: '',
      BASE_URL: 'https://should-not-apply-on-qa.example',
    });

    expect(config.uiBaseUrl).toBe(ENVIRONMENT_CATALOG.qa.uiBaseUrl);
    expect(config.apiBaseUrl).toBe(ENVIRONMENT_CATALOG.qa.apiBaseUrl);
    expect(config.isLive).toBe(false);
  });

  test('TEST_ENV inválido falla con mensaje claro', async () => {
    expect(() => resolveEnvironment({ TEST_ENV: 'staging' })).toThrow(/TEST_ENV inválido/);
  });

  for (const name of ENVIRONMENT_NAMES) {
    test(`catálogo incluye ambiente "${name}" con URLs http(s)`, async () => {
      const entry = ENVIRONMENT_CATALOG[name];
      expect(entry.name).toBe(name);
      expect(entry.uiBaseUrl).toMatch(/^https?:\/\//);
      expect(entry.apiBaseUrl).toMatch(/^https?:\/\//);
      expect(entry.apiMaxResponseMs).toBeGreaterThan(0);
    });
  }
});
