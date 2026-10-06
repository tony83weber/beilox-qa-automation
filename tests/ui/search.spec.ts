import { test, expect } from '../../src/fixtures/test-fixtures';
import { noResultsSearch, validSearch } from '../../src/data/search-data';
import {
  expectEmptySearchBlocked,
  expectHomeSearchFormVisible,
  expectNoSearchResults,
  expectReturnedToSearchableHome,
  expectValidSearchResults,
} from '../../src/assertions/search.assertions';

test.describe('UI — Búsqueda Central de Pasajes', () => {
  test('búsqueda válida muestra resultados coherentes con origen y destino', async ({
    homePage,
    resultsPage,
    page,
  }) => {
    await test.step('Abrir home / buscador', async () => {
      await homePage.open();
    });
    await expectHomeSearchFormVisible(page, homePage);

    await test.step('Completar búsqueda válida y enviar', async () => {
      await homePage.search(validSearch);
    });
    await test.step('Esperar página de resultados', async () => {
      await resultsPage.waitForResultsSettled();
    });

    await expectValidSearchResults(page, resultsPage);
  });

  test('búsqueda sin resultados muestra estado vacío', async ({ homePage, resultsPage, page }) => {
    await test.step('Abrir home / buscador', async () => {
      await homePage.open();
    });
    await test.step('Completar búsqueda sin resultados y enviar', async () => {
      await homePage.search(noResultsSearch);
    });
    await test.step('Esperar página de resultados', async () => {
      await resultsPage.waitForResultsSettled();
    });

    await test.step('Aserción: URL de resultados', async () => {
      await expect(page).toHaveURL(/pasajes-micro\//i);
    });
    await expectNoSearchResults(page, resultsPage);
  });

  test('datos inválidos (formulario vacío) bloquean la búsqueda', async ({ homePage, page }) => {
    await test.step('Abrir home / buscador', async () => {
      await homePage.open();
    });
    await test.step('Enviar búsqueda vacía', async () => {
      await homePage.submitEmptySearch();
    });
    await expectEmptySearchBlocked(page, homePage);
  });

  test('volver atrás desde resultados recupera el buscador', async ({
    homePage,
    resultsPage,
    page,
  }) => {
    await test.step('Abrir home / buscador', async () => {
      await homePage.open();
    });
    await test.step('Completar búsqueda válida y enviar', async () => {
      await homePage.search(validSearch);
    });
    await test.step('Esperar página de resultados', async () => {
      await resultsPage.waitForResultsSettled();
    });
    await expectValidSearchResults(page, resultsPage);

    await test.step('Volver atrás (browser back)', async () => {
      await homePage.goBack();
    });
    await expectReturnedToSearchableHome(page, homePage);
    await test.step('Aserción: URL de home', async () => {
      await expect(page).toHaveURL(/centraldepasajes\.com\.ar\/?$/i);
    });
  });
});
