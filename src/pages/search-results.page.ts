import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

const RESULTS_TIMEOUT_MS = 45_000;

export class SearchResultsPage extends BasePage {
  readonly serviceItems: Locator;
  readonly emptyStateMessage: Locator;
  readonly siteErrorDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.serviceItems = page.locator('#servicios [id*="ServiciosListView"], #servicios #divData');
    this.emptyStateMessage = page.getByText(/No encontramos opciones para tu viaje/i);
    this.siteErrorDialog = page.getByText(/Detectamos un error, volvé a la Home/i);
  }

  /** Título de la búsqueda, ej. "Retiro Buenos Aires hacia Mar del Plata". */
  routeHeading(origin: string, destination: string): Locator {
    return this.page.getByRole('heading', {
      level: 1,
      name: new RegExp(`${origin}.*hacia.*${destination}`, 'i'),
    });
  }

  /**
   * Espera a que la búsqueda termine: servicios, mensaje de vacío o error del sitio.
   * `or()` en un único expect evita el Promise.race, cuyo "perdedor" quedaba en rojo en Allure.
   */
  async waitForResultsSettled(): Promise<void> {
    await expect(this.page).toHaveURL(/pasajes-micro\//i, { timeout: RESULTS_TIMEOUT_MS });
    await expect(
      this.serviceItems.or(this.emptyStateMessage).or(this.siteErrorDialog).first(),
    ).toBeVisible({ timeout: RESULTS_TIMEOUT_MS });

    if (await this.siteErrorDialog.isVisible()) {
      throw new Error(
        'Error del sitio, no del test: Central de Pasajes mostró "¡Ups! Detectamos un error". ' +
          'Suele ser transitorio (en CI lo cubren los retries).',
      );
    }
  }
}
