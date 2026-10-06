import { expect, type Page } from '@playwright/test';
import type { HomePage } from '../pages/home.page';
import type { SearchResultsPage } from '../pages/search-results.page';
import { uiAssertStep } from '../helpers/ui-evidence';
import { formatResultsUrlDate } from '../data/search-data';
import type { SearchCriteria } from '../types/search';

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
  criteria: SearchCriteria,
): Promise<void> {
  const { origin, destination } = criteria.routeLabels;
  const expectedDate = formatResultsUrlDate(criteria.departureDaysAhead);
  const expectedPassengers = String(criteria.passengers ?? 1);

  await uiAssertStep(
    page,
    `Verifica resultados de ${origin} a ${destination} para el ${expectedDate}, ${expectedPassengers} pasajero(s)`,
    async () => {
      await expect(page).toHaveURL(
        new RegExp(`pasajes-micro/.*${toSlug(origin)}.*/${toSlug(destination)}`, 'i'),
      );
      await expect(page).toHaveURL((url) => url.searchParams.get('FIda') === expectedDate);
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('CntPas') === expectedPassengers,
      );
      await expect(resultsPage.routeHeading(origin, destination)).toBeVisible();
      await expect(resultsPage.serviceItems.first()).toBeVisible();
      await expect(resultsPage.serviceItems.first()).toContainText(/\$/);
    },
  );
}

function toSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
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
