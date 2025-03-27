import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

export const useIsEnableUnifiedMergeView = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useSWRStatic<boolean, Error>('isEnableUnifiedMergeView', initialData, { fallbackData: false });
};
