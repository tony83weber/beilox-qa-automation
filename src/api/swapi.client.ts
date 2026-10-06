import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { getEnv } from '../types/env';
import { saveApiEvidence, type SaveEvidenceInput } from './api-evidence';

export type TimedResponse = {
  response: APIResponse;
  body: unknown;
  elapsedMs: number;
  endpoint: string;
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
    const endpointPath = pathname.replace(/^\//, '');
    const url = pathname.startsWith('http')
      ? pathname
      : `${this.baseUrl}/${endpointPath}`;
    const started = Date.now();
    const response = await this.request.get(url, {
      headers: { Accept: 'application/json' },
    });
    const elapsedMs = Date.now() - started;
    const body = (await response.json().catch(async () => ({
      raw: await response.text(),
    }))) as unknown;
    return {
      response,
      body,
      elapsedMs,
      endpoint: `GET /${endpointPath}`,
    };
  }

  async getResourceList(
    resource: SwapiResource,
    query?: { page?: number; limit?: number },
  ): Promise<TimedResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return this.get(qs ? `${resource}?${qs}` : resource);
  }

  async getResourceById(resource: SwapiResource, id: string | number): Promise<TimedResponse> {
    return this.get(`${resource}/${id}`);
  }

  saveEvidence(
    input: Omit<SaveEvidenceInput, 'status' | 'elapsedMs' | 'body' | 'endpoint'> & {
      timed: TimedResponse;
      updateHappyPath?: boolean;
    },
  ): ReturnType<typeof saveApiEvidence> {
    return saveApiEvidence({
      resource: input.resource,
      scenario: input.scenario,
      endpoint: input.timed.endpoint,
      status: input.timed.response.status(),
      elapsedMs: input.timed.elapsedMs,
      body: input.timed.body,
      updateHappyPath: input.updateHappyPath,
    });
  }
}
