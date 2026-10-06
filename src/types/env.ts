import { resolveEnvironment } from '../config/resolve-environment';
import type { EnvironmentConfig } from '../config/environment.types';

/** @deprecated Preferir EnvironmentConfig; se mantiene por compatibilidad. */
export type AppEnv = {
  name: EnvironmentConfig['name'];
  baseUrl: string;
  swapiBaseUrl: string;
  apiMaxResponseMs: number;
  isLive: boolean;
};

export function getEnv(): AppEnv {
  const config = resolveEnvironment();
  return {
    name: config.name,
    baseUrl: config.uiBaseUrl,
    swapiBaseUrl: config.apiBaseUrl,
    apiMaxResponseMs: config.apiMaxResponseMs,
    isLive: config.isLive,
  };
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return resolveEnvironment();
}
