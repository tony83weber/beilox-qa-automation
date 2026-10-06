import { test, expect } from '../../src/fixtures/test-fixtures';
import { assertValidSchema, compileSchema } from '../../src/api/schema-validator';
import { filmsListSchema, notFoundSchema } from '../../src/schemas/swapi.schemas';

const listSchema = compileSchema(filmsListSchema);
const errorSchema = compileSchema(notFoundSchema);

test.describe('API — /films', () => {
  test('happy path: lista films 200 + schema + tiempo razonable', async ({ swapiClient }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceList('films');

    expect(response.status()).toBe(200);
    assertValidSchema(listSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());

    const saved = swapiClient.saveHappyPathBody('films', body);
    expect(saved).toContain('films-happy-path.json');
  });

  test('error 404: id inexistente', async ({ swapiClient }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceById('films', 99999);

    expect(response.status()).toBe(404);
    assertValidSchema(errorSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
  });

  test('error esperado: id malformado responde 404 (sin 400 estable en SWAPI)', async ({
    swapiClient,
  }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceById(
      'films',
      'not-a-valid-id',
    );

    expect(response.status()).toBe(404);
    assertValidSchema(errorSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
  });
});
