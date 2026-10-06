import { test, expect } from '../../src/fixtures/test-fixtures';
import { assertValidSchema, compileSchema } from '../../src/api/schema-validator';
import {
  notFoundSchema,
  peoplePlanetsListSchema,
  resourceDetailSchema,
} from '../../src/schemas/swapi.schemas';
import {
  assertNoUidOverlapBetweenPages,
  assertNotFoundBody,
  assertPeoplePlanetsListContract,
  assertPersonDetail,
} from '../../src/assertions/api.assertions';

const listSchema = compileSchema(peoplePlanetsListSchema);
const detailSchema = compileSchema(resourceDetailSchema);
const errorSchema = compileSchema(notFoundSchema);

test.describe('API — /people', () => {
  test('happy path: lista people con contrato, entidad esperada y evidencia', async ({
    swapiClient,
  }) => {
    const timed = await swapiClient.getResourceList('people');

    expect(timed.response.status()).toBe(200);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(listSchema, timed.body);
    assertPeoplePlanetsListContract(timed.body, 'Luke Skywalker');

    const saved = await swapiClient.saveEvidence({
      resource: 'people',
      scenario: 'happy-path-list',
      timed,
      updateHappyPath: true,
    });
    expect(saved.evidencePath).toContain('people-happy-path-list.json');
    expect(saved.happyPathPath).toContain('people-happy-path.json');
  });

  test('paginación: página 1 y 2 no comparten uids', async ({ swapiClient }) => {
    // SWAPI.tech sin `limit` ignora page y repite página 1 — hay que paginar con limit.
    const page1 = await swapiClient.getResourceList('people', { page: 1, limit: 10 });
    const page2 = await swapiClient.getResourceList('people', { page: 2, limit: 10 });

    expect(page1.response.status()).toBe(200);
    expect(page2.response.status()).toBe(200);
    assertPeoplePlanetsListContract(page1.body, 'Luke Skywalker');
    assertNoUidOverlapBetweenPages(page1.body, page2.body);

    await swapiClient.saveEvidence({
      resource: 'people',
      scenario: 'pagination-page-2',
      timed: page2,
    });
  });

  test('detalle: people/1 es Luke Skywalker', async ({ swapiClient }) => {
    const timed = await swapiClient.getResourceById('people', 1);

    expect(timed.response.status()).toBe(200);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(detailSchema, timed.body);
    assertPersonDetail(timed.body, { uid: '1', name: 'Luke Skywalker' });

    await swapiClient.saveEvidence({
      resource: 'people',
      scenario: 'detail-luke',
      timed,
    });
  });

  test('error 404: id inexistente', async ({ swapiClient }) => {
    const timed = await swapiClient.getResourceById('people', 99999);

    expect(timed.response.status()).toBe(404);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(errorSchema, timed.body);
    assertNotFoundBody(timed.body);

    await swapiClient.saveEvidence({
      resource: 'people',
      scenario: 'error-404-missing-id',
      timed,
    });
  });

  test('error esperado: id malformado responde 404 (SWAPI no expone 400 estable)', async ({
    swapiClient,
  }) => {
    const timed = await swapiClient.getResourceById('people', 'not-a-valid-id');

    expect(timed.response.status()).toBe(404);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(errorSchema, timed.body);
    assertNotFoundBody(timed.body);

    await swapiClient.saveEvidence({
      resource: 'people',
      scenario: 'error-404-malformed-id',
      timed,
    });
  });
});
