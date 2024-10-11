import OpenAI from 'openai';

import { configManager } from '~/server/service/config-manager';

export const openaiClient = new OpenAI({
  apiKey: configManager?.getConfig('crowi', 'openai:projectApiKey'), // This is the default and can be omitted
});
