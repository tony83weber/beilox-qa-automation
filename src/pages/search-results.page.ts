import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchResultsPage extends BasePage {
  readonly servicesList: Locator;
  readonly serviceItems: Locator;
  readonly emptyStateMessage: Locator;
  readonly newSearchLink: Locator;
  readonly modifySearchControl: Locator;
  readonly tripSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.servicesList = page.locator('#servicios');
    this.serviceItems = page.locator('#servicios [id*="ServiciosListView"], #servicios #divData');
    this.emptyStateMessage = page.getByText(/No encontramos opciones para tu viaje/i);
    this.newSearchLink = page.getByRole('link', { name: /NUEVA BÚSQUEDA/i }).or(
      page.getByText(/NUEVA BÚSQUEDA/i),
    );
    this.modifySearchControl = page.getByText(/Modificar/i).first();
    this.tripSummary = page.locator('#content, #divBag');
  }

  async waitForResultsSettled(): Promise<void> {
    // Un solo wait (sin Promise.race): el "perdedor" del race quedaba en rojo en Allure
    // aunque el test pasara.
    await this.page.waitForURL(/pasajes-micro\//i, { timeout: 45_000 }).catch(() => undefined);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForFunction(
      () => {
        const bodyText = document.body?.innerText ?? '';
        const hasEmpty = /No encontramos opciones para tu viaje/i.test(bodyText);
        const hasServices = !!document.querySelector(
          '#servicios [id*="ServiciosListView"], #servicios #divData',
        );
        return hasEmpty || hasServices;
      },
      undefined,
      { timeout: 45_000 },
    );
  }
}
