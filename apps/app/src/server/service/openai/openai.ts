import { OpenAI } from 'openai';

export interface IOpenaiService {
  embed: (user: string, input: string) => Promise<OpenAI.Embedding[]>;
}

class OpenaiService implements IOpenaiService {

  client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
    });
  }

  async embed(userId: string, input: string): Promise<OpenAI.Embedding[]> {
    const result = await this.client.embeddings.create({
      input,
      model: 'text-embedding-3-large',
      dimensions: process.env.OPENAI_DIMENSIONS as unknown as number,
      user: userId,
    });

    return result.data;
  }

}

export const openaiService = new OpenaiService();
