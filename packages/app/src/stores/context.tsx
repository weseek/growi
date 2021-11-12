import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';

type Hoge = any;
export const useHoge = (initialData?: Hoge): SWRResponse<Hoge, Error> => {
  return useStaticSWR<Hoge, Error>('hoge', initialData || null);
};
