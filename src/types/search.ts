export type SearchCriteria = {
  originQuery: string;
  originOptionIncludes: string;
  destinationQuery: string;
  destinationOptionIncludes: string;
  /** Days ahead from today for departure date. */
  departureDaysAhead: number;
  passengers?: number;
};

export type SearchScenario = 'valid' | 'noResults' | 'invalidEmpty';
