import { responseInterface } from 'swr';

import { useStaticSWR } from './use-static-swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useEnvVars = (initialData?: any): responseInterface<any, any> => {
  return useStaticSWR('envVars', initialData);
};
