import { test, expect } from '../../src/fixtures/test-fixtures';
import { assertValidSchema, compileSchema } from '../../src/api/schema-validator';
import { filmsListSchema, notFoundSchema } from '../../src/schemas/swapi.schemas';
import { assertFilmsListContract, assertNotFoundBody } from '../../src/assertions/api.assertions';

const listSchema = compileSchema(filmsListSchema);
const errorSchema = compileSchema(notFoundSchema);

test.describe('API — /films', () => {
  test('happy path: lista films con títulos/episodios únicos y evidencia', async ({
    swapiClient,
  }) => {
    const timed = await swapiClient.getResourceList('films');

    expect(timed.response.status()).toBe(200);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(listSchema, timed.body);
    assertFilmsListContract(timed.body, 'A New Hope');

    const saved = await swapiClient.saveEvidence({
      resource: 'films',
      scenario: 'happy-path-list',
      timed,
      updateHappyPath: true,
    });
    expect(saved.happyPathPath).toContain('films-happy-path.json');
  });

  test('error 404: id inexistente', async ({ swapiClient }) => {
    const timed = await swapiClient.getResourceById('films', 99999);

    expect(timed.response.status()).toBe(404);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(errorSchema, timed.body);
    assertNotFoundBody(timed.body);

    await swapiClient.saveEvidence({
      resource: 'films',
      scenario: 'error-404-missing-id',
      timed,
    });
  });

  test('error esperado: id malformado responde 404 (sin 400 estable en SWAPI)', async ({
    swapiClient,
  }) => {
    const timed = await swapiClient.getResourceById('films', 'not-a-valid-id');

    expect(timed.response.status()).toBe(404);
    expect(timed.elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
    assertValidSchema(errorSchema, timed.body);
    assertNotFoundBody(timed.body);

    await swapiClient.saveEvidence({
      resource: 'films',
      scenario: 'error-404-malformed-id',
      timed,
    });
  });
});
