import { SWRResponse } from 'swr';

import { useStaticSWR } from './use-static-swr';


export const useRedirectFrom = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR('redirectFrom', initialData);
};
