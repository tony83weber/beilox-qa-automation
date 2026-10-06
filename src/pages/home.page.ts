import { expect, type Locator, type Page } from '@playwright/test';
import type { SearchCriteria } from '../types/search';
import { formatDepartureDate } from '../data/search-data';
import { BasePage } from './base.page';

/**
 * Page Object del home / buscador de Central de Pasajes.
 * Selectores y acciones viven acá; las aserciones de dominio en assertions/.
 * Roles y nombres accesibles relevados con Playwright MCP (docs/mcp-evidence/).
 */
export class HomePage extends BasePage {
  readonly originCombobox: Locator;
  readonly destinationCombobox: Locator;
  readonly departureDateInput: Locator;
  readonly passengersSelect: Locator;
  readonly searchButton: Locator;
  readonly originHiddenInput: Locator;
  readonly destinationHiddenInput: Locator;
  readonly originRequiredMessage: Locator;
  readonly destinationRequiredMessage: Locator;
  readonly dateRequiredMessage: Locator;

  constructor(page: Page) {
    super(page);
    // El nombre accesible del combobox Select2 es el valor elegido (cambia al volver atrás),
    // así que se ancla al aria-labelledby, que es fijo.
    this.originCombobox = page.locator('[aria-labelledby="select2-PadOrigen-container"]');
    this.destinationCombobox = page.locator('[aria-labelledby="select2-PadDestino-container"]');
    this.departureDateInput = page.getByRole('textbox', { name: 'Ida', exact: true });
    this.passengersSelect = page.locator('#pasajeros');
    this.searchButton = page.getByRole('button', { name: 'Buscar', exact: true });
    // Inputs nativos ocultos por Select2: única fuente confiable del valor elegido.
    this.originHiddenInput = page.locator('#PadOrigen');
    this.destinationHiddenInput = page.locator('#PadDestino');
    this.originRequiredMessage = page.getByText('Completá el Origen de tu viaje');
    this.destinationRequiredMessage = page.getByText('Completá el Destino de tu viaje');
    this.dateRequiredMessage = page.getByText('Completá la fecha');
  }

  async open(): Promise<void> {
    await this.gotoHome();
    await expect(this.searchButton).toBeVisible();
  }

  async selectOrigin(query: string, optionIncludes: string): Promise<void> {
    await this.pickSelect2(this.originCombobox, this.originHiddenInput, query, optionIncludes);
  }

  async selectDestination(query: string, optionIncludes: string): Promise<void> {
    await this.pickSelect2(
      this.destinationCombobox,
      this.destinationHiddenInput,
      query,
      optionIncludes,
    );
  }

  async setDepartureDate(daysAhead: number): Promise<void> {
    const value = formatDepartureDate(daysAhead);
    await expect(this.departureDateInput).toBeVisible();
    await this.page.evaluate((dateValue) => {
      const el = document.getElementById('fechaPartida');
      if (!el) {
        throw new Error('#fechaPartida no encontrado');
      }
      const jq = (
        window as unknown as {
          jQuery?: (selector: HTMLElement) => { val: (v: string) => { trigger: (e: string) => void } };
        }
      ).jQuery;
      if (jq) {
        jq(el).val(dateValue).trigger('change');
        return;
      }
      (el as HTMLInputElement).value = dateValue;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  async setPassengers(count: number): Promise<void> {
    await this.passengersSelect.selectOption(String(count));
  }

  async submitSearch(): Promise<void> {
    // CDP dispara navegación full-page; en Firefox el click default puede
    // quedarse esperando "scheduled navigations" más allá del actionTimeout.
    await this.searchButton.click({ noWaitAfter: true });
  }

  async search(criteria: SearchCriteria): Promise<void> {
    await this.selectOrigin(criteria.originQuery, criteria.originOptionIncludes);
    await this.selectDestination(
      criteria.destinationQuery,
      criteria.destinationOptionIncludes,
    );
    await this.setDepartureDate(criteria.departureDaysAhead);
    if (criteria.passengers) {
      await this.setPassengers(criteria.passengers);
    }
    await this.submitSearch();
  }

  async submitEmptySearch(): Promise<void> {
    await this.submitSearch();
  }

  private async pickSelect2(
    combobox: Locator,
    hiddenInput: Locator,
    query: string,
    optionIncludes: string,
  ): Promise<void> {
    await this.closeSelect2Dropdowns();
    await combobox.click({ force: true });

    const searchField = this.page.locator('.select2-container--open .select2-search__field');
    await expect(searchField).toBeVisible();
    await searchField.fill(query);

    const option = this.page.getByRole('treeitem').filter({ hasText: optionIncludes }).first();
    await expect(option).toBeVisible();
    await option.click();

    // CDP deja a veces `.select2-container--open` aunque la opción ya quedó elegida.
    // No esperamos "hidden" (timeout → step rojo en Allure); validamos el value del input.
    await expect(hiddenInput).not.toHaveValue('', { timeout: 10_000 });
    await this.closeSelect2Dropdowns();
  }

  private async closeSelect2Dropdowns(): Promise<void> {
    await this.page.evaluate(() => {
      const jq = (
        window as unknown as {
          jQuery?: (selector: string) => { select2?: (cmd: string) => void };
        }
      ).jQuery;
      if (!jq) {
        return;
      }
      for (const id of ['PadOrigen', 'PadDestino']) {
        try {
          jq(`#${id}`).select2?.('close');
        } catch {
          // ignore
        }
      }
    });
  }
}
