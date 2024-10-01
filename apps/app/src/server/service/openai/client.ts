import OpenAI from 'openai';

import { configManager } from '~/server/service/config-manager';

export const openaiClient = new OpenAI({
  apiKey: configManager?.getConfig('crowi', 'app:openaiApiKey'), // This is the default and can be omitted
});
