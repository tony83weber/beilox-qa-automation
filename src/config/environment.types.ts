export const ENVIRONMENT_NAMES = ['dev', 'qa', 'prod'] as const;

export type EnvironmentName = (typeof ENVIRONMENT_NAMES)[number];

export type EnvironmentConfig = {
  name: EnvironmentName;
  displayName: string;
  /** URL base UI (Playwright `use.baseURL` para projects UI). */
  uiBaseUrl: string;
  /** URL base API (Playwright `use.baseURL` para project api + SwapiClient). */
  apiBaseUrl: string;
  apiMaxResponseMs: number;
  /**
   * true = ambiente real alcanzable (hoy solo prod).
   * false = placeholders listos para CI secrets / URLs futuras.
   */
  isLive: boolean;
};

export type ProcessEnvLike = Record<string, string | undefined>;
