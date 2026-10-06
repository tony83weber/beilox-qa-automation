import { expect } from '@playwright/test';

type ListItem = {
  uid?: string;
  name?: string;
  url?: string;
};

type PeoplePlanetsListBody = {
  message?: string;
  total_records?: number;
  total_pages?: number;
  next?: string | null;
  previous?: string | null;
  results?: ListItem[];
};

type FilmListItem = {
  uid?: string;
  properties?: {
    title?: string;
    episode_id?: number;
  };
};

type FilmsListBody = {
  message?: string;
  result?: FilmListItem[];
};

type DetailBody = {
  message?: string;
  result?: {
    uid?: string;
    properties?: Record<string, unknown>;
  };
};

export function assertPeoplePlanetsListContract(
  body: unknown,
  expectedName: string,
): asserts body is PeoplePlanetsListBody {
  const data = body as PeoplePlanetsListBody;
  expect(data.message, 'message del listado').toBe('ok');
  expect(data.results, 'results').toBeTruthy();
  expect(data.results!.length, 'cantidad de results en página').toBeGreaterThan(0);
  expect(data.total_records, 'total_records').toBeGreaterThan(0);

  const uids = data.results!.map((item) => item.uid).filter(Boolean) as string[];
  expect(new Set(uids).size, 'uids únicos en la página').toBe(uids.length);

  const names = data.results!.map((item) => item.name);
  expect(names, `debe incluir "${expectedName}"`).toContain(expectedName);
}

export function assertNoUidOverlapBetweenPages(
  pageOne: unknown,
  pageTwo: unknown,
): void {
  const first = pageOne as PeoplePlanetsListBody;
  const second = pageTwo as PeoplePlanetsListBody;
  const uidsOne = new Set((first.results ?? []).map((item) => item.uid));
  const uidsTwo = (second.results ?? []).map((item) => item.uid);

  expect(uidsTwo.length, 'página 2 debe traer results').toBeGreaterThan(0);
  for (const uid of uidsTwo) {
    expect(uidsOne.has(uid), `uid ${uid} no debería repetirse entre página 1 y 2`).toBe(
      false,
    );
  }
}

export function assertPersonDetail(body: unknown, expected: { uid: string; name: string }): void {
  const data = body as DetailBody;
  expect(data.message).toBe('ok');
  expect(data.result?.uid).toBe(expected.uid);
  expect(data.result?.properties?.name).toBe(expected.name);
}

export function assertFilmsListContract(body: unknown, expectedTitle: string): void {
  const data = body as FilmsListBody;
  expect(data.message).toBe('ok');
  expect(data.result?.length, 'films en result').toBeGreaterThan(0);

  const uids = (data.result ?? []).map((item) => item.uid).filter(Boolean) as string[];
  expect(new Set(uids).size, 'uids de films únicos').toBe(uids.length);

  const episodeIds = (data.result ?? [])
    .map((item) => item.properties?.episode_id)
    .filter((id): id is number => typeof id === 'number');
  expect(new Set(episodeIds).size, 'episode_id únicos').toBe(episodeIds.length);

  const titles = (data.result ?? []).map((item) => item.properties?.title);
  expect(titles, `debe incluir "${expectedTitle}"`).toContain(expectedTitle);
}

export function assertNotFoundBody(body: unknown): void {
  const data = body as { message?: string; messsage?: string };
  const text = data.message ?? data.messsage;
  expect(typeof text, 'mensaje de error presente').toBe('string');
  expect(String(text).length, 'mensaje de error no vacío').toBeGreaterThan(0);
}
