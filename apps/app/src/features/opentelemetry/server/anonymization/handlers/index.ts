import type { AnonymizationModule } from '../interfaces/anonymization-module';

import { pageListingApiModule } from './page-listing-api-handler';
import { searchApiModule } from './search-api-handler';

/**
 * List of anonymization modules
 */
export const anonymizationModules: AnonymizationModule[] = [
  searchApiModule,
  pageListingApiModule,
];
