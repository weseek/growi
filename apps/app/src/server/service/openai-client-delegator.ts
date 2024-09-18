import OpenAI from 'openai';

import { aiServiceType as serviceType, aiServiceTypes } from '~/interfaces/ai';
import { configManager } from '~/server/service/config-manager';

export default class OpenaiClient {

  private client: OpenAI;

  private isOpenai: boolean;

  constructor() {
    const aiServiceType = configManager?.getConfig('crowi', 'app:aiServiceType');

    if (aiServiceType == null || !aiServiceTypes.includes(aiServiceType)) {
      throw new Error('AI_SERVICE_TYPE is missing or contains an invalid value');
    }

    this.isOpenai = aiServiceType === serviceType.OPEN_AI;

    // TODO: Support for @azure/openai
    this.client = new OpenAI({ apiKey: configManager?.getConfig('crowi', 'app:openaiApiKey') });
  }

}
