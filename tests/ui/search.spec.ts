import { test, expect } from '../../src/fixtures/test-fixtures';
import { noResultsSearch, validSearch } from '../../src/data/search-data';
import {
  expectEmptySearchBlocked,
  expectHomeSearchFormVisible,
  expectNoSearchResults,
  expectReturnedToSearchableHome,
  expectValidSearchResults,
} from '../../src/assertions/search.assertions';

test.describe('UI — Búsqueda de pasajes', () => {
  test(
    'Encuentra pasajes de Retiro a Mar del Plata',
    { tag: ['@smoke', '@regression', '@ui'] },
    async ({ homePage, resultsPage, page }) => {
      await test.step('Entra al sitio y ve el buscador', async () => {
        await homePage.open();
      });
      await expectHomeSearchFormVisible(page, homePage);

      await test.step('Busca viaje Retiro → Mar del Plata con fecha futura', async () => {
        await homePage.search(validSearch);
        await resultsPage.waitForResultsSettled();
      });

      await expectValidSearchResults(page, resultsPage);
    },
  );

  test(
    'Muestra mensaje cuando no hay pasajes disponibles',
    { tag: ['@regression', '@ui'] },
    async ({ homePage, resultsPage, page }) => {
      await test.step('Entra al sitio y ve el buscador', async () => {
        await homePage.open();
      });
      await test.step('Busca un tramo sin disponibilidad (Ushuaia → La Quiaca)', async () => {
        await homePage.search(noResultsSearch);
        await resultsPage.waitForResultsSettled();
      });

      await test.step('Queda en la pantalla de resultados de esa búsqueda', async () => {
        await expect(page).toHaveURL(/pasajes-micro\//i);
      });
      await expectNoSearchResults(page, resultsPage);
    },
  );

  test(
    'No permite buscar si faltan origen, destino o fecha',
    { tag: ['@smoke', '@regression', '@ui'] },
    async ({ homePage, page }) => {
      await test.step('Entra al sitio y ve el buscador', async () => {
        await homePage.open();
      });
      await test.step('Intenta buscar sin completar los datos', async () => {
        await homePage.submitEmptySearch();
      });
      await expectEmptySearchBlocked(page, homePage);
    },
  );

  test(
    'Puede volver al buscador desde la pantalla de resultados',
    { tag: ['@regression', '@ui'] },
    async ({ homePage, resultsPage, page }) => {
      await test.step('Entra al sitio y ve el buscador', async () => {
        await homePage.open();
      });
      await test.step('Busca viaje Retiro → Mar del Plata con fecha futura', async () => {
        await homePage.search(validSearch);
        await resultsPage.waitForResultsSettled();
      });
      await expectValidSearchResults(page, resultsPage);

      await test.step('Vuelve atrás con el navegador', async () => {
        await homePage.goBack();
      });
      await expectReturnedToSearchableHome(page, homePage);
      await test.step('Confirma que volvió a la página de inicio', async () => {
        await expect(page).toHaveURL(/centraldepasajes\.com\.ar\/?$/i);
      });
    },
  );
});
