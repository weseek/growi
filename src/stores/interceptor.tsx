import { SWRResponse } from 'swr';
import InterceptorManager from '~/service/interceptor-manager';

import { useStaticSWR } from './use-static-swr';

export const useInterceptorManager = (initialData?: InterceptorManager): SWRResponse<InterceptorManager, any> => {
  return useStaticSWR('interceptorManager', initialData);
};
