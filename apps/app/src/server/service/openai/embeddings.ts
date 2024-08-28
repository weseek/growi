import crypto from 'crypto';

import type { OpenAI } from 'openai';

import { openaiClient } from './client';


const hasher = crypto.createHash('sha256');

export const embed = async(input: string, username?: string): Promise<OpenAI.Embedding[]> => {
  let user;

  if (username != null) {
    hasher.update(username);
    user = hasher.digest('hex');
  }

  const result = await openaiClient.embeddings.create({
    input,
    model: 'text-embedding-3-large',
    dimensions: Number(process.env.OPENAI_DIMENSIONS),
    user,
  });

  return result.data;
};
