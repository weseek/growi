import type { IInlineComment } from '@growi/core/dist/interfaces';
import { useSWRStatic } from '@growi/core/dist/swr';
import { SWRResponse } from 'swr';

export const useInlineComments = (): SWRResponse<IInlineComment[]> => {
  const key = 'inlineComments';

  return useSWRStatic<IInlineComment[], Error>(key, [], {
    keepPreviousData: true,
  });
};
