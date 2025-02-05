import { apiv3Post, apiv3Delete } from '~/client/util/apiv3-client';

import type { IApiv3AiAssistantCreateParams } from '../../interfaces/ai-assistant';

export const createAiAssistant = async(body: IApiv3AiAssistantCreateParams): Promise<void> => {
  await apiv3Post('/openai/ai-assistant', body);
};

export const deleteAiAssistant = async(id: string): Promise<void> => {
  await apiv3Delete(`/openai/ai-assistant/${id}`);
};
