import type { EnvironmentConfig, EnvironmentName } from './environment.types';

/**
 * Catálogo de ambientes.
 * - prod: URLs reales del challenge (CDP + SWAPI).
 * - qa / dev: placeholders tipados. En CI se pisan con secrets
 *   `UI_BASE_URL` / `API_BASE_URL` cuando existan ambientes internos.
 */
export const ENVIRONMENT_CATALOG: Record<EnvironmentName, EnvironmentConfig> = {
  prod: {
    name: 'prod',
    displayName: 'Production',
    uiBaseUrl: 'https://www.centraldepasajes.com.ar',
    apiBaseUrl: 'https://www.swapi.tech/api',
    apiMaxResponseMs: 5000,
    isLive: true,
  },
  qa: {
    name: 'qa',
    displayName: 'QA',
    uiBaseUrl: 'https://qa.centraldepasajes.invalid',
    apiBaseUrl: 'https://qa.api.swapi.invalid',
    apiMaxResponseMs: 5000,
    isLive: false,
  },
  dev: {
    name: 'dev',
    displayName: 'Development',
    uiBaseUrl: 'https://dev.centraldepasajes.invalid',
    apiBaseUrl: 'https://dev.api.swapi.invalid',
    apiMaxResponseMs: 5000,
    isLive: false,
  },
};
