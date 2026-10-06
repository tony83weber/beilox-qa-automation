import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * `load` y no `domcontentloaded`: si se navega antes del evento load, Firefox reemplaza
   * la entrada del historial (spec HTML) y "volver atrás" desde resultados no tiene a dónde ir.
   */
  async gotoHome(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'load' });
  }

  async goBack(): Promise<void> {
    const fromUrl = this.page.url();
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(this.page).not.toHaveURL(fromUrl);
  }
}
