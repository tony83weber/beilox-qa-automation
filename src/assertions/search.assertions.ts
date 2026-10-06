import { expect, type Page } from '@playwright/test';
import type { HomePage } from '../pages/home.page';
import type { SearchResultsPage } from '../pages/search-results.page';
import { uiAssertStep } from '../helpers/ui-evidence';

export async function expectHomeSearchFormVisible(
  page: Page,
  homePage: HomePage,
): Promise<void> {
  await uiAssertStep(page, 'Verifica que el buscador está listo para usar', async () => {
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
    'Verifica que hay resultados de Retiro a Mar del Plata',
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
  await uiAssertStep(page, 'Verifica el mensaje de que no hay pasajes', async () => {
    await expect(resultsPage.emptyStateMessage).toBeVisible();
    await expect(resultsPage.serviceItems).toHaveCount(0);
  });
}

export async function expectEmptySearchBlocked(page: Page, homePage: HomePage): Promise<void> {
  await uiAssertStep(
    page,
    'Verifica que el sitio pide completar origen, destino y fecha',
    async () => {
      await expect(page).toHaveURL(/centraldepasajes\.com\.ar\/?$/i);
      await expect(homePage.searchButton).toBeVisible();
      await expect(homePage.originRequiredMessage).toBeVisible();
      await expect(homePage.destinationRequiredMessage).toBeVisible();
      await expect(homePage.dateRequiredMessage).toBeVisible();
    },
  );
}

export async function expectReturnedToSearchableHome(
  page: Page,
  homePage: HomePage,
): Promise<void> {
  await uiAssertStep(page, 'Verifica que el buscador volvió a estar disponible', async () => {
    await expect(homePage.searchButton).toBeVisible();
    await expect(homePage.originCombobox).toBeVisible();
    await expect(homePage.destinationCombobox).toBeVisible();
    await expect(homePage.departureDateInput).toBeVisible();
  });
}
