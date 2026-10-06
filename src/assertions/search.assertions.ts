import { expect, type Page } from '@playwright/test';
import type { HomePage } from '../pages/home.page';
import type { SearchResultsPage } from '../pages/search-results.page';
import { uiAssertStep } from '../helpers/ui-evidence';

export async function expectHomeSearchFormVisible(
  page: Page,
  homePage: HomePage,
): Promise<void> {
  await uiAssertStep(page, 'Aserción: formulario de búsqueda visible', async () => {
    await expect(homePage.searchButton).toBeVisible();
    await expect(homePage.originCombobox).toBeVisible();
    await expect(homePage.destinationCombobox).toBeVisible();
    await expect(homePage.departureDateInput).toBeVisible();
  });
}

export async function expectValidSearchResults(
  page: Page,
  resultsPage: SearchResultsPage,
): Promise<void> {
  await uiAssertStep(
    page,
    'Aserción: resultados coherentes con Retiro → Mar del Plata',
    async () => {
      await expect(page).toHaveURL(/pasajes-micro\/.*retiro.*mar-del-plata/i);
      await expect(resultsPage.serviceItems.first()).toBeVisible();
      await expect(page.getByText(/Retiro|Buenos Aires/i).first()).toBeVisible();
      await expect(page.getByText(/Mar del Plata/i).first()).toBeVisible();
      await expect(page.getByText(/SALE|DESDE \$/i).first()).toBeVisible();
    },
  );
}

export async function expectNoSearchResults(
  page: Page,
  resultsPage: SearchResultsPage,
): Promise<void> {
  await uiAssertStep(page, 'Aserción: estado sin resultados', async () => {
    await expect(resultsPage.emptyStateMessage).toBeVisible();
    await expect(resultsPage.serviceItems).toHaveCount(0);
  });
}

export async function expectEmptySearchBlocked(page: Page, homePage: HomePage): Promise<void> {
  await uiAssertStep(page, 'Aserción: búsqueda vacía bloqueada (HTML5 invalid)', async () => {
    await expect(page).toHaveURL(/centraldepasajes\.com\.ar\/?$/i);
    await expect(homePage.searchButton).toBeVisible();

    const invalidFields = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('#PadOrigen:invalid, #PadDestino:invalid, #fechaPartida:invalid'),
      ).map((el) => el.id),
    );
    expect(invalidFields.length).toBeGreaterThan(0);
    expect(invalidFields).toEqual(
      expect.arrayContaining(['PadOrigen', 'PadDestino', 'fechaPartida']),
    );
  });
}

export async function expectReturnedToSearchableHome(
  page: Page,
  homePage: HomePage,
): Promise<void> {
  await uiAssertStep(page, 'Aserción: home usable tras volver atrás', async () => {
    await expect(homePage.searchButton).toBeVisible();
    await expect(homePage.originCombobox).toBeVisible();
    await expect(homePage.destinationCombobox).toBeVisible();
    await expect(homePage.departureDateInput).toBeVisible();
  });
}
