import type OpenAI from 'openai';
import type { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';

export const useSWRxMessages = (aiAssistantId?: string, threadId?: string): SWRResponse<OpenAI.Beta.Threads.Messages.MessagesPage, Error> => {
  const key = aiAssistantId != null && threadId != null ? [`/openai/messages/${aiAssistantId}/${threadId}`] : null;
  return useSWRImmutable<OpenAI.Beta.Threads.Messages.MessagesPage>(
    key,
    ([endpoint]) => apiv3Get(endpoint).then(response => response.data.messages),
  );
};
