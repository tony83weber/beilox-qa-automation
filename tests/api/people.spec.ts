import { test, expect } from '../../src/fixtures/test-fixtures';
import { assertValidSchema, compileSchema } from '../../src/api/schema-validator';
import {
  notFoundSchema,
  peoplePlanetsListSchema,
  resourceDetailSchema,
} from '../../src/schemas/swapi.schemas';

const listSchema = compileSchema(peoplePlanetsListSchema);
const detailSchema = compileSchema(resourceDetailSchema);
const errorSchema = compileSchema(notFoundSchema);

test.describe('API — /people', () => {
  test('happy path: lista people 200 + schema + tiempo razonable', async ({ swapiClient }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceList('people');

    expect(response.status()).toBe(200);
    assertValidSchema(listSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());

    const saved = swapiClient.saveHappyPathBody('people', body);
    expect(saved).toContain('people-happy-path.json');
  });

  test('error 404: id inexistente', async ({ swapiClient }) => {
    const { response, body, elapsedMs } = await swapiClient.getResourceById('people', 99999);

    expect(response.status()).toBe(404);
    assertValidSchema(errorSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
  });

  test('error esperado: id malformado responde 404 (SWAPI no expone 400 estable)', async ({
    swapiClient,
  }) => {
    // Criterio: no inventamos un 400. Documentamos el comportamiento real.
    const { response, body, elapsedMs } = await swapiClient.getResourceById(
      'people',
      'not-a-valid-id',
    );

    expect(response.status()).toBe(404);
    assertValidSchema(errorSchema, body);
    expect(elapsedMs).toBeLessThan(swapiClient.getMaxResponseMs());
  });

  test('detalle por id válido (smoke de estructura result.properties)', async ({ swapiClient }) => {
    const { response, body } = await swapiClient.getResourceById('people', 1);
    expect(response.status()).toBe(200);
    assertValidSchema(detailSchema, body);
  });
});
