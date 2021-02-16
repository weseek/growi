import { responseInterface } from 'swr';
import InterceptorManager from '~/service/interceptor-manager';

import { useStaticSWR } from './use-static-swr';

export const useInterceptorManager = (initialData?: InterceptorManager): responseInterface<InterceptorManager, any> => {
  return useStaticSWR('interceptorManager', initialData);
};
