import type { Locator, Page } from '@playwright/test';
import type { SearchCriteria } from '../types/search';
import { formatDepartureDate } from '../data/search-data';
import { BasePage } from './base.page';

/**
 * Page Object del home / buscador de Central de Pasajes.
 * Selectores y acciones viven acá; las aserciones de dominio en assertions/.
 */
export class HomePage extends BasePage {
  readonly originCombobox: Locator;
  readonly destinationCombobox: Locator;
  readonly departureDateInput: Locator;
  readonly passengersSelect: Locator;
  readonly searchButton: Locator;
  readonly originHiddenInput: Locator;
  readonly destinationHiddenInput: Locator;

  constructor(page: Page) {
    super(page);
    this.originCombobox = page.locator('span[aria-labelledby="select2-PadOrigen-container"]');
    this.destinationCombobox = page.locator(
      'span[aria-labelledby="select2-PadDestino-container"]',
    );
    this.departureDateInput = page.locator('#fechaPartida');
    this.passengersSelect = page.locator('#pasajeros');
    this.searchButton = page.locator('#btnCons');
    this.originHiddenInput = page.locator('#PadOrigen');
    this.destinationHiddenInput = page.locator('#PadDestino');
  }

  async open(): Promise<void> {
    await this.gotoHome();
    await this.searchButton.waitFor({ state: 'visible' });
  }

  async selectOrigin(query: string, optionIncludes: string): Promise<void> {
    await this.pickSelect2(this.originCombobox, 'select2-PadOrigen-container', query, optionIncludes);
  }

  async selectDestination(query: string, optionIncludes: string): Promise<void> {
    await this.pickSelect2(
      this.destinationCombobox,
      'select2-PadDestino-container',
      query,
      optionIncludes,
    );
  }

  async setDepartureDate(daysAhead: number): Promise<void> {
    const value = formatDepartureDate(daysAhead);
    await this.departureDateInput.waitFor({ state: 'visible' });
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
    containerId: string,
    query: string,
    optionIncludes: string,
  ): Promise<void> {
    await combobox.click({ force: true });

    const openDropdown = this.page.locator('.select2-container--open');
    if ((await openDropdown.count()) === 0) {
      await this.page.locator(`#${containerId}`).click({ force: true });
    }

    const searchField = this.page.locator('.select2-search__field:visible');
    await searchField.waitFor({ state: 'visible' });
    await searchField.fill(query);

    const options = this.page.locator('.select2-results__option');
    await options.first().waitFor({ state: 'visible' });
    const preferred = options.filter({ hasText: optionIncludes });
    if ((await preferred.count()) > 0) {
      await preferred.first().click();
    } else {
      await options.first().click();
    }

    await openDropdown
      .first()
      .waitFor({ state: 'hidden', timeout: 5_000 })
      .catch(() => undefined);
  }
}
