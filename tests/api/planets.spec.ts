import { test, expect } from '../../src/fixtures/test-fixtures';
import { assertValidSchema, compileSchema } from '../../src/api/schema-validator';
import { notFoundSchema, peoplePlanetsListSchema } from '../../src/schemas/swapi.schemas';

const listSchema = compileSchema(peoplePlanetsListSchema);
const errorSchema = compileSchema(notFoundSchema);

test.describe('API — /planets', () => {
  test('happy path: lista planets 200 + schema + tiempo razonable', async ({ swapiClient }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceList('planets');

    expect(response.status()).toBe(200);
    assertValidSchema(listSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());

    const saved = swapiClient.saveHappyPathBody('planets', body);
    expect(saved).toContain('planets-happy-path.json');
  });

  test('error 404: id inexistente', async ({ swapiClient }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceById('planets', 99999);

    expect(response.status()).toBe(404);
    assertValidSchema(errorSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
  });

  test('error esperado: id malformado responde 404 (sin 400 estable en SWAPI)', async ({
    swapiClient,
  }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceById(
      'planets',
      'not-a-valid-id',
    );

    expect(response.status()).toBe(404);
    assertValidSchema(errorSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
  });
});
