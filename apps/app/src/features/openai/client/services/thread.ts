import { apiv3Delete } from '~/client/util/apiv3-client';

export const deleteThread = async(aiAssistantId: string, threadRelationId: string): Promise<void> => {
  await apiv3Delete(`/openai/thread/${aiAssistantId}/${threadRelationId}`);
};
