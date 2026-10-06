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
    await this.page.waitForLoadState('domcontentloaded');
    await Promise.race([
      this.serviceItems.first().waitFor({ state: 'visible', timeout: 45_000 }),
      this.emptyStateMessage.waitFor({ state: 'visible', timeout: 45_000 }),
    ]);
  }
}
