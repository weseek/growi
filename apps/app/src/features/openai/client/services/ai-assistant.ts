import { apiv3Post, apiv3Put, apiv3Delete } from '~/client/util/apiv3-client';

import type { UpsertAiAssistantData, AiAssistantHasId } from '../../interfaces/ai-assistant';

export const createAiAssistant = async(body: UpsertAiAssistantData): Promise<void> => {
  await apiv3Post('/openai/ai-assistant', body);
};

export const updateAiAssistant = async(id: string, body: UpsertAiAssistantData): Promise<AiAssistantHasId> => {
  const res = await apiv3Put<{updatedAiAssistant: AiAssistantHasId}>(`/openai/ai-assistant/${id}`, body);
  return res.data.updatedAiAssistant;
};

export const setDefaultAiAssistant = async(id: string, isDefault: boolean): Promise<void> => {
  await apiv3Put(`/openai/ai-assistant/${id}/set-default`, { isDefault });
};

export const deleteAiAssistant = async(id: string): Promise<void> => {
  await apiv3Delete(`/openai/ai-assistant/${id}`);
};
