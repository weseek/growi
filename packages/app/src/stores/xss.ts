
import { useStaticSWR } from './use-static-swr';
import { SWRResponse } from 'swr';
import Xss from '~/services/xss';

export const useXss = (initialData?: Xss): SWRResponse<Xss, Error> => {
  return useStaticSWR<Xss, Error>('xss', initialData);
};
