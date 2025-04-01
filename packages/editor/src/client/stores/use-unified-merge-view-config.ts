import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type UnifiedMergeViewConfig = {
  isEnabled: boolean
  insertText?: string
}

export const useUnifiedMergeViewConfig = (initialData?: UnifiedMergeViewConfig): SWRResponse<UnifiedMergeViewConfig, Error> => {
  return useSWRStatic<UnifiedMergeViewConfig, Error>('unifiedMergeViewConfig', initialData);
};
