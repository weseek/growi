import type { OpenAI } from 'openai';

import { openaiClient } from './client';

export const embed = async(username: string, input: string): Promise<OpenAI.Embedding[]> => {
  const result = await openaiClient.embeddings.create({
    input,
    model: 'text-embedding-3-large',
    dimensions: Number(process.env.OPENAI_DIMENSIONS),
    user: username,
  });

  return result.data;
};
