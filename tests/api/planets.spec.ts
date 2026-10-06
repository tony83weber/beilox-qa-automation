import { test, expect } from '../../src/fixtures/test-fixtures';
import { assertValidSchema, compileSchema } from '../../src/api/schema-validator';
import { notFoundSchema, peoplePlanetsListSchema } from '../../src/schemas/swapi.schemas';
import {
  assertNoUidOverlapBetweenPages,
  assertNotFoundBody,
  assertPeoplePlanetsListContract,
} from '../../src/assertions/api.assertions';

const listSchema = compileSchema(peoplePlanetsListSchema);
const errorSchema = compileSchema(notFoundSchema);

test.describe('API — /planets', { tag: ['@api', '@regression'] }, () => {
  test(
    'happy path: lista planets con contrato, Tatooine y evidencia',
    { tag: ['@smoke'] },
    async ({ swapiClient }) => {
      const timed = await swapiClient.getResourceList('planets');

      expect(timed.response.status()).toBe(200);
      expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
      assertValidSchema(listSchema, timed.body);
      assertPeoplePlanetsListContract(timed.body, 'Tatooine');

      const saved = await swapiClient.saveEvidence({
        resource: 'planets',
        scenario: 'happy-path-list',
        timed,
        updateHappyPath: true,
      });
      expect(saved.happyPathPath).toContain('planets-happy-path.json');
    },
  );

  test('paginación: página 1 y 2 no comparten uids', async ({ swapiClient }) => {
    // Sin `limit`, SWAPI.tech puede devolver la misma página 1 otra vez.
    const page1 = await swapiClient.getResourceList('planets', { page: 1, limit: 10 });
    const page2 = await swapiClient.getResourceList('planets', { page: 2, limit: 10 });

    for (const page of [page1, page2]) {
      expect(page.response.status()).toBe(200);
      expect(page.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
      assertValidSchema(listSchema, page.body);
    }
    assertPeoplePlanetsListContract(page1.body, 'Tatooine');
    assertNoUidOverlapBetweenPages(page1.body, page2.body);

    await swapiClient.saveEvidence({
      resource: 'planets',
      scenario: 'pagination-page-2',
      timed: page2,
    });
  });

  test(
    'error 404: id inexistente',
    { tag: ['@smoke'] },
    async ({ swapiClient }) => {
      const timed = await swapiClient.getResourceById('planets', 99999);

      expect(timed.response.status()).toBe(404);
      expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
      assertValidSchema(errorSchema, timed.body);
      assertNotFoundBody(timed.body);

      await swapiClient.saveEvidence({
        resource: 'planets',
        scenario: 'error-404-missing-id',
        timed,
      });
    },
  );

  test('error esperado: id malformado responde 404 (sin 400 estable en SWAPI)', async ({
    swapiClient,
  }) => {
    const timed = await swapiClient.getResourceById('planets', 'not-a-valid-id');

    expect(timed.response.status()).toBe(404);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(errorSchema, timed.body);
    assertNotFoundBody(timed.body);

    await swapiClient.saveEvidence({
      resource: 'planets',
      scenario: 'error-404-malformed-id',
      timed,
    });
  });
});
