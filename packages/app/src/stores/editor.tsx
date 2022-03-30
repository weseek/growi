import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';

export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSlackEnabled', isEnabled, { fallbackData: false });
};
