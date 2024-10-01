import crypto from 'crypto';

import type { OpenAI } from 'openai';

import { configManager } from '~/server/service/config-manager';

import { openaiClient } from './client';


export const embed = async(input: string, username?: string): Promise<OpenAI.Embedding[]> => {
  let user;

  if (username != null) {
    const hasher = crypto.createHash('sha256');
    hasher.update(username);
    user = hasher.digest('hex');
  }

  const result = await openaiClient.embeddings.create({
    input,
    model: 'text-embedding-3-large',
    dimensions: configManager.getConfig('crowi', 'app:openaiDimensions'),
    user,
  });

  return result.data;
};
