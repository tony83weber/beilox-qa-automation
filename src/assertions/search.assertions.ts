import { expect, type Page } from '@playwright/test';
import type { HomePage } from '../pages/home.page';
import type { SearchResultsPage } from '../pages/search-results.page';

export async function expectHomeSearchFormVisible(homePage: HomePage): Promise<void> {
  await expect(homePage.searchButton).toBeVisible();
  await expect(homePage.originCombobox).toBeVisible();
  await expect(homePage.destinationCombobox).toBeVisible();
  await expect(homePage.departureDateInput).toBeVisible();
}

export async function expectValidSearchResults(
  page: Page,
  resultsPage: SearchResultsPage,
): Promise<void> {
  await expect(page).toHaveURL(/pasajes-micro\/.*retiro.*mar-del-plata/i);
  await expect(resultsPage.serviceItems.first()).toBeVisible();
  await expect(page.getByText(/Retiro|Buenos Aires/i).first()).toBeVisible();
  await expect(page.getByText(/Mar del Plata/i).first()).toBeVisible();
  await expect(page.getByText(/SALE|DESDE \$/i).first()).toBeVisible();
}

export async function expectNoSearchResults(resultsPage: SearchResultsPage): Promise<void> {
  await expect(resultsPage.emptyStateMessage).toBeVisible();
  await expect(resultsPage.serviceItems).toHaveCount(0);
}

export async function expectEmptySearchBlocked(page: Page, homePage: HomePage): Promise<void> {
  // HTML5 validation: no navega fuera del home
  await expect(page).toHaveURL(/centraldepasajes\.com\.ar\/?$/i);
  await expect(homePage.searchButton).toBeVisible();

  const invalidFields = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('#PadOrigen:invalid, #PadDestino:invalid, #fechaPartida:invalid'),
    ).map((el) => el.id),
  );
  expect(invalidFields.length).toBeGreaterThan(0);
  expect(invalidFields).toEqual(expect.arrayContaining(['PadOrigen', 'PadDestino', 'fechaPartida']));
}

export async function expectReturnedToSearchableHome(homePage: HomePage): Promise<void> {
  await expectHomeSearchFormVisible(homePage);
}
