import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

export const useResolvedTheme = (): SWRResponse => {
  return useSWRStatic('resolvedTheme', undefined, { fallbackData: undefined });
};
