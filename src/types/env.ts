export type AppEnv = {
  baseUrl: string;
  swapiBaseUrl: string;
  apiMaxResponseMs: number;
};

export function getEnv(): AppEnv {
  const apiMaxResponseMs = Number(process.env.API_MAX_RESPONSE_MS ?? '5000');

  return {
    baseUrl: process.env.BASE_URL ?? 'https://www.centraldepasajes.com.ar',
    swapiBaseUrl: process.env.SWAPI_BASE_URL ?? 'https://www.swapi.tech/api',
    apiMaxResponseMs: Number.isFinite(apiMaxResponseMs) ? apiMaxResponseMs : 5000,
  };
}
