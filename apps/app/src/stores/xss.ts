
import type { SWRResponse } from 'swr';

import type Xss from '~/services/general-xss-filter';

import { useStaticSWR } from './use-static-swr';

export const useXss = (initialData?: Xss): SWRResponse<Xss, Error> => {
  return useStaticSWR<Xss, Error>('xss', initialData);
};
