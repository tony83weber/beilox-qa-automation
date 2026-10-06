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
    await homePage.open();
    await expectHomeSearchFormVisible(homePage);

    await homePage.search(validSearch);
    await resultsPage.waitForResultsSettled();

    await expectValidSearchResults(page, resultsPage);
  });

  test('búsqueda sin resultados muestra estado vacío', async ({ homePage, resultsPage, page }) => {
    await homePage.open();
    await homePage.search(noResultsSearch);
    await resultsPage.waitForResultsSettled();

    await expect(page).toHaveURL(/pasajes-micro\//i);
    await expectNoSearchResults(resultsPage);
  });

  test('datos inválidos (formulario vacío) bloquean la búsqueda', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.submitEmptySearch();
    await expectEmptySearchBlocked(page, homePage);
  });

  test('volver atrás desde resultados recupera el buscador', async ({
    homePage,
    resultsPage,
    page,
  }) => {
    await homePage.open();
    await homePage.search(validSearch);
    await resultsPage.waitForResultsSettled();
    await expectValidSearchResults(page, resultsPage);

    await homePage.goBack();
    await expectReturnedToSearchableHome(homePage);
    await expect(page).toHaveURL(/centraldepasajes\.com\.ar\/?$/i);
  });
});
