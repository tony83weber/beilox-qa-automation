import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { SwapiClient } from '../api/swapi.client';
import { getEnvironmentConfig } from '../types/env';
import type { EnvironmentConfig } from '../config/environment.types';

type Fixtures = {
  environment: EnvironmentConfig;
  homePage: HomePage;
  resultsPage: SearchResultsPage;
  swapiClient: SwapiClient;
};

export const test = base.extend<Fixtures>({
  // auto: true → corre aunque el test no declare `environment` (gate UI/API).
  environment: [
    async ({}, use, testInfo) => {
      const config = getEnvironmentConfig();
      const projectName = testInfo.project.name;
      const isE2EProject = projectName.startsWith('ui-') || projectName === 'api';

      if (isE2EProject && !config.isLive) {
        testInfo.skip(
          true,
          `Ambiente "${config.name}" no está live. Usá TEST_ENV=prod o inyectá UI_BASE_URL/API_BASE_URL.`,
        );
      }

      await use(config);
    },
    { auto: true },
  ],
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
