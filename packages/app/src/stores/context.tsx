import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';

import { TargetAndAncestors } from '../interfaces/page-listing-results';

export const useTargetAndAncestors = (initialData?: TargetAndAncestors): SWRResponse<TargetAndAncestors, Error> => {
  return useStaticSWR<TargetAndAncestors, Error>('targetAndAncestors', initialData || null);
};
