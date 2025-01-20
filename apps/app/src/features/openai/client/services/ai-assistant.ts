import { apiv3Post } from '~/client/util/apiv3-client';

import type { IApiv3AiAssistantCreateParams } from '../../interfaces/ai-assistant';

export const createAiAssistant = async(body: IApiv3AiAssistantCreateParams): Promise<void> => {
  await apiv3Post('/openai/ai-assistant', body);
};
