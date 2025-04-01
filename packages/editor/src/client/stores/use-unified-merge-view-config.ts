import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

export type DetectedDiff = {
  insert?: string,
  delete?: number,
  retain?: number,
}

type UnifiedMergeViewConfig = {
  isEnabled: boolean,
  detectedDiff?: DetectedDiff,
}

export const useUnifiedMergeViewConfig = (initialData?: UnifiedMergeViewConfig): SWRResponse<UnifiedMergeViewConfig, Error> => {
  return useSWRStatic<UnifiedMergeViewConfig, Error>('unifiedMergeViewConfig', initialData);
};
