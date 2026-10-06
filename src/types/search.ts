export type SearchCriteria = {
  originQuery: string;
  originOptionIncludes: string;
  destinationQuery: string;
  destinationOptionIncludes: string;
  /** Cómo el sitio nombra origen y destino en la pantalla de resultados. */
  routeLabels: { origin: string; destination: string };
  /** Days ahead from today for departure date. */
  departureDaysAhead: number;
  passengers?: number;
};
