import type { SearchCriteria } from '../types/search';

/** Ruta popular con alta probabilidad de disponibilidad. */
export const validSearch: SearchCriteria = {
  originQuery: 'Buenos Aires',
  originOptionIncludes: 'Terminal Retiro',
  destinationQuery: 'Mar del Plata',
  destinationOptionIncludes: 'Mar del Plata Terminal',
  routeLabels: { origin: 'Retiro', destination: 'Mar del Plata' },
  departureDaysAhead: 21,
  passengers: 1,
};

/** Combinación poco probable → mensaje de sin opciones. */
export const noResultsSearch: SearchCriteria = {
  originQuery: 'Ushuaia',
  originOptionIncludes: 'Ushuaia',
  destinationQuery: 'La Quiaca',
  destinationOptionIncludes: 'Quiaca',
  routeLabels: { origin: 'Ushuaia', destination: 'La Quiaca' },
  departureDaysAhead: 100,
  passengers: 1,
};

export function departureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

function departureDateParts(daysAhead: number): { dd: string; mm: string; yyyy: string } {
  const date = departureDate(daysAhead);
  return {
    dd: String(date.getDate()).padStart(2, '0'),
    mm: String(date.getMonth() + 1).padStart(2, '0'),
    yyyy: String(date.getFullYear()),
  };
}

/** Formato con el que el calendario del home completa `#fechaPartida`: dd-mm-yyyy. */
export function formatDepartureDate(daysAhead: number): string {
  const { dd, mm, yyyy } = departureDateParts(daysAhead);
  return `${dd}-${mm}-${yyyy}`;
}

/** Formato con el que el sitio refleja la fecha en la URL de resultados (`FIda`): MM/DD/YYYY. */
export function formatResultsUrlDate(daysAhead: number): string {
  const { dd, mm, yyyy } = departureDateParts(daysAhead);
  return `${mm}/${dd}/${yyyy}`;
}
