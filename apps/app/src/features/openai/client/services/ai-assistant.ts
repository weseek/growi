import { apiv3Post } from '~/client/util/apiv3-client';

import type { AiAssistant } from '../../interfaces/ai-assistant';

export const createAiAssistant = async(body: Omit<AiAssistant, 'vectorStore' | 'owner'>): Promise<void> => {
  await apiv3Post('/openai/ai-assistant', body);
};
