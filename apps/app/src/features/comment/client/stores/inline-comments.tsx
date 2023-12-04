import { useSWRStatic } from '@growi/core/dist/swr';
import { SWRResponse } from 'swr';

import { IComment } from '~/interfaces/comment';

export const useInlineComments = (): SWRResponse<IComment[]> => {
  const key = 'inlineComments';

  return useSWRStatic<IComment[], Error>(key, [], {
    keepPreviousData: true,
  });
};
