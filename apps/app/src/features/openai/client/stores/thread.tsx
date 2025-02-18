import { type SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';

import type { IThreadRelationHasId } from '../../interfaces/thread-relation';

export const useSWRxThreads = (aiAssistantId: string): SWRResponse<IThreadRelationHasId[], Error> => {
  const key = [`openai/threads/${aiAssistantId}`];

  return useSWRImmutable<IThreadRelationHasId[]>(
    key,
    ([endpoint]) => apiv3Get(endpoint).then(response => response.data.threads),
  );
};
