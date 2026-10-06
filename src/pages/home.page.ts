import { expect, type Locator, type Page } from '@playwright/test';
import type { SearchCriteria } from '../types/search';
import { departureDate, formatDepartureDate } from '../data/search-data';
import { BasePage } from './base.page';

const CALENDAR_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

/**
 * Page Object del home / buscador de Central de Pasajes.
 * Selectores y acciones viven acá; las aserciones de dominio en assertions/.
 * Las acciones usan la UI como una persona: sin JavaScript inyectado en la página.
 * Roles y nombres accesibles relevados con Playwright MCP (docs/mcp-evidence/).
 */
export class HomePage extends BasePage {
  readonly originCombobox: Locator;
  readonly destinationCombobox: Locator;
  readonly departureDateInput: Locator;
  readonly calendarMonth: Locator;
  readonly calendarNextMonth: Locator;
  readonly passengersSelect: Locator;
  readonly searchButton: Locator;
  readonly originHiddenInput: Locator;
  readonly destinationHiddenInput: Locator;
  readonly originRequiredMessage: Locator;
  readonly destinationRequiredMessage: Locator;
  readonly dateRequiredMessage: Locator;
  readonly promoBanner: Locator;
  private readonly calendar: Locator;

  constructor(page: Page) {
    super(page);
    // El nombre accesible del combobox Select2 es el valor elegido (cambia al volver atrás),
    // así que se ancla al aria-labelledby, que es fijo.
    this.originCombobox = page.locator('[aria-labelledby="select2-PadOrigen-container"]');
    this.destinationCombobox = page.locator('[aria-labelledby="select2-PadDestino-container"]');
    this.departureDateInput = page.getByRole('textbox', { name: 'Ida', exact: true });
    this.calendar = page.locator('#cdp-calendar-container');
    this.calendarMonth = this.calendar.locator('.month-name');
    this.calendarNextMonth = this.calendar.locator('.next');
    this.passengersSelect = page.locator('#pasajeros');
    this.searchButton = page.getByRole('button', { name: 'Buscar', exact: true });
    // Inputs nativos ocultos por Select2: única fuente confiable del valor elegido.
    this.originHiddenInput = page.locator('#PadOrigen');
    this.destinationHiddenInput = page.locator('#PadDestino');
    this.originRequiredMessage = page.getByText('Completá el Origen de tu viaje');
    this.destinationRequiredMessage = page.getByText('Completá el Destino de tu viaje');
    this.dateRequiredMessage = page.getByText('Completá la fecha');
    this.promoBanner = page.locator('#alertDialog');
  }

  async open(): Promise<void> {
    await this.gotoHome();
    await expect(this.searchButton).toBeVisible();
    await this.dismissPromoBanner();
  }

  /**
   * En mobile el banner de promo tapa la flecha del calendario, así que se cierra con su "×"
   * antes de usar el buscador. Es contenido de marketing opcional: si no hay promo, no hay nada
   * que cerrar. No se usa addLocatorHandler porque también corre antes de cada aserción y su clic
   * fuera del dropdown cerraba Select2 en medio de la selección.
   */
  private async dismissPromoBanner(): Promise<void> {
    if (await this.promoBanner.isVisible()) {
      await this.promoBanner.getByRole('link', { name: 'close' }).click();
      await expect(this.promoBanner).toBeHidden();
    }
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

  /** Abre el calendario, avanza mes a mes hasta la fecha y elige el día. */
  async setDepartureDate(daysAhead: number): Promise<void> {
    const target = departureDate(daysAhead);
    const today = new Date();
    const monthsAhead =
      (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());

    await this.departureDateInput.click();
    await expect(this.calendarMonth).toHaveText(calendarMonthLabel(today));

    for (let step = 1; step <= monthsAhead; step++) {
      await this.calendarNextMonth.click();
      const shown = new Date(today.getFullYear(), today.getMonth() + step, 1);
      await expect(this.calendarMonth).toHaveText(calendarMonthLabel(shown));
    }

    await this.calendar
      .locator('.day.toMonth.valid')
      .filter({ hasText: new RegExp(`^${target.getDate()}$`) })
      .click();
    await expect(this.departureDateInput).toHaveValue(formatDepartureDate(daysAhead));
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
    await combobox.click();

    const searchField = this.page.locator('.select2-container--open .select2-search__field');
    await expect(searchField).toBeVisible();
    // Tecla por tecla: Select2 busca por `keyup`. `fill()` deja el texto pero la búsqueda
    // llega vacía y el dropdown responde "No se encontraron resultados".
    await searchField.pressSequentially(query, { delay: 20 });

    const option = this.page.getByRole('treeitem').filter({ hasText: optionIncludes }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(hiddenInput).not.toHaveValue('');

    // El sitio deja el dropdown abierto después de elegir la opción. Escape lo cierra
    // como lo haría una persona; si no se cierra, el próximo clic se consume en cerrarlo.
    await this.page.keyboard.press('Escape');
    await expect(searchField).toBeHidden();
  }
}

function calendarMonthLabel(date: Date): RegExp {
  return new RegExp(`${CALENDAR_MONTHS[date.getMonth()]}\\s*${date.getFullYear()}`);
}
