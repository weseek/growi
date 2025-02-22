import type OpenAI from 'openai';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';

import { apiv3Get } from '~/client/util/apiv3-client';

export const useSWRMUTxMessages = (aiAssistantId: string, threadId?: string): SWRMutationResponse<OpenAI.Beta.Threads.Messages.MessagesPage | null> => {
  const key = threadId != null ? [`/openai/messages/${aiAssistantId}/${threadId}`] : null;
  return useSWRMutation(
    key,
    ([endpoint]) => apiv3Get(endpoint).then(response => response.data.messages),
  );
};
