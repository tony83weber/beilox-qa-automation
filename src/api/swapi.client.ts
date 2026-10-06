import { type APIRequestContext, type APIResponse } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { getEnv } from '../types/env';

export type TimedResponse = {
  response: APIResponse;
  body: unknown;
  elapsedMs: number;
};

export type SwapiResource = 'people' | 'planets' | 'films';

export class SwapiClient {
  private readonly baseUrl: string;
  private readonly maxResponseMs: number;

  constructor(private readonly request: APIRequestContext) {
    const env = getEnv();
    this.baseUrl = env.swapiBaseUrl.replace(/\/$/, '');
    this.maxResponseMs = env.apiMaxResponseMs;
  }

  getMaxResponseMs(): number {
    return this.maxResponseMs;
  }

  async get(pathname: string): Promise<TimedResponse> {
    const url = pathname.startsWith('http')
      ? pathname
      : `${this.baseUrl}/${pathname.replace(/^\//, '')}`;
    const started = Date.now();
    const response = await this.request.get(url, {
      headers: { Accept: 'application/json' },
    });
    const elapsedMs = Date.now() - started;
    const body = (await response.json().catch(async () => ({
      raw: await response.text(),
    }))) as unknown;
    return { response, body, elapsedMs };
  }

  async getResourceList(resource: SwapiResource): Promise<TimedResponse> {
    return this.get(resource);
  }

  async getResourceById(resource: SwapiResource, id: string | number): Promise<TimedResponse> {
    return this.get(`${resource}/${id}`);
  }

  saveHappyPathBody(resource: SwapiResource, body: unknown): string {
    const dir = path.resolve(process.cwd(), 'api-responses');
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${resource}-happy-path.json`);
    fs.writeFileSync(filePath, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
    return filePath;
  }
}
