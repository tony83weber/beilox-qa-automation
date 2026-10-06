import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { SwapiClient } from '../api/swapi.client';

type Fixtures = {
  homePage: HomePage;
  resultsPage: SearchResultsPage;
  swapiClient: SwapiClient;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  resultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  swapiClient: async ({ request }, use) => {
    await use(new SwapiClient(request));
  },
});

export { expect } from '@playwright/test';
