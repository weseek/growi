import { apiv3Delete } from '~/client/util/apiv3-client';

export const deleteThread = async(aiAssistantId: string, threadId: string): Promise<void> => {
  await apiv3Delete(`/openai/thread/${aiAssistantId}/${threadId}`);
};
