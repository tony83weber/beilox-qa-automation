import { resolveEnvironment } from '../config/resolve-environment';
import type { EnvironmentConfig } from '../config/environment.types';

export function getEnvironmentConfig(): EnvironmentConfig {
  return resolveEnvironment();
}
