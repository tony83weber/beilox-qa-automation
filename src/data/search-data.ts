import type { SearchCriteria } from '../types/search';

/** Ruta popular con alta probabilidad de disponibilidad. */
export const validSearch: SearchCriteria = {
  originQuery: 'Buenos Aires',
  originOptionIncludes: 'Terminal Retiro',
  destinationQuery: 'Mar del Plata',
  destinationOptionIncludes: 'Mar del Plata Terminal',
  departureDaysAhead: 21,
  passengers: 1,
};

/** Combinación poco probable → mensaje de sin opciones. */
export const noResultsSearch: SearchCriteria = {
  originQuery: 'Ushuaia',
  originOptionIncludes: 'Ushuaia',
  destinationQuery: 'La Quiaca',
  destinationOptionIncludes: 'Quiaca',
  departureDaysAhead: 100,
  passengers: 1,
};

export function formatDepartureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  // El home de CDP acepta dd-mm-yyyy en #fechaPartida
  return `${dd}-${mm}-${yyyy}`;
}

export function expectedResultsPathFragment(criteria: SearchCriteria): RegExp {
  // URL productiva usa slugs; validamos presencia de fragmentos conocidos.
  if (criteria === validSearch || criteria.originOptionIncludes.includes('Retiro')) {
    return /pasajes-micro\/.*retiro.*mar-del-plata/i;
  }
  return /pasajes-micro\//i;
}
