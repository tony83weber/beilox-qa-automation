import { ENVIRONMENT_CATALOG } from './environments';
import {
  ENVIRONMENT_NAMES,
  type EnvironmentConfig,
  type EnvironmentName,
  type ProcessEnvLike,
} from './environment.types';

function isEnvironmentName(value: string): value is EnvironmentName {
  return (ENVIRONMENT_NAMES as readonly string[]).includes(value);
}

/** Ignora undefined y strings vacíos (secrets ausentes en CI llegan como ""). */
function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

/**
 * Lee `TEST_ENV` (alias `ENV`) y resuelve el catálogo.
 *
 * Overrides (en orden de prioridad):
 * 1. Específicos por ambiente: `QA_UI_BASE_URL`, `DEV_API_BASE_URL`, etc.
 * 2. Genéricos de la corrida: `UI_BASE_URL` / `API_BASE_URL`
 * 3. Legacy solo en prod: `BASE_URL` / `SWAPI_BASE_URL`
 *    (así un .env de prod local no “prende” qa/dev por accidente)
 *
 * Si hay override aplicable, `isLive` pasa a true.
 */
export function resolveEnvironment(
  processEnv: ProcessEnvLike = process.env,
): EnvironmentConfig {
  const raw = (processEnv.TEST_ENV ?? processEnv.ENV ?? 'prod').trim().toLowerCase();

  if (!isEnvironmentName(raw)) {
    throw new Error(
      `TEST_ENV inválido: "${raw}". Valores permitidos: ${ENVIRONMENT_NAMES.join(', ')}`,
    );
  }

  const base = ENVIRONMENT_CATALOG[raw];
  const prefix = raw.toUpperCase(); // DEV | QA | PROD

  const uiOverride = firstNonEmpty(
    processEnv[`${prefix}_UI_BASE_URL`],
    processEnv.UI_BASE_URL,
    raw === 'prod' ? processEnv.BASE_URL : undefined,
  );
  const apiOverride = firstNonEmpty(
    processEnv[`${prefix}_API_BASE_URL`],
    processEnv.API_BASE_URL,
    raw === 'prod' ? processEnv.SWAPI_BASE_URL : undefined,
  );

  const uiBaseUrl = uiOverride ?? base.uiBaseUrl;
  const apiBaseUrl = apiOverride ?? base.apiBaseUrl;

  const parsedMs = Number(
    firstNonEmpty(
      processEnv[`${prefix}_API_MAX_RESPONSE_MS`],
      processEnv.API_MAX_RESPONSE_MS,
    ) ?? String(base.apiMaxResponseMs),
  );
  const apiMaxResponseMs = Number.isFinite(parsedMs) ? parsedMs : base.apiMaxResponseMs;

  const urlOverridden = !!uiOverride || !!apiOverride;

  return {
    ...base,
    uiBaseUrl: uiBaseUrl.replace(/\/$/, ''),
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    apiMaxResponseMs,
    isLive: base.isLive || urlOverridden,
  };
}

export function requireLiveEnvironment(config: EnvironmentConfig): void {
  if (!config.isLive) {
    throw new Error(
      `El ambiente "${config.name}" no está marcado como live. ` +
        `Definí ${config.name.toUpperCase()}_UI_BASE_URL / ${config.name.toUpperCase()}_API_BASE_URL ` +
        `(o UI_BASE_URL/API_BASE_URL), o usá TEST_ENV=prod.`,
    );
  }
}
