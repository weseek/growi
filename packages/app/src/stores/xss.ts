
import { SWRResponse } from 'swr';

import Xss from '~/services/xss';

import { useStaticSWR } from './use-static-swr';

export const useXss = (initialData?: Xss): SWRResponse<Xss, Error> => {
  return useStaticSWR<Xss, Error>('xss', initialData);
};
