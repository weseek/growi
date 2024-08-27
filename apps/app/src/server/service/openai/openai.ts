import { OpenAI } from 'openai';

export interface IOpenaiService {
  embed: (username: string, input: string) => Promise<OpenAI.Embedding[]>;
}

class OpenaiService implements IOpenaiService {

  client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
    });
  }

  async embed(username: string, input: string): Promise<OpenAI.Embedding[]> {
    const result = await this.client.embeddings.create({
      input,
      model: 'text-embedding-3-large',
      dimensions: Number(process.env.OPENAI_DIMENSIONS),
      user: username,
    });

    return result.data;
  }

}

export const openaiService = new OpenaiService();
