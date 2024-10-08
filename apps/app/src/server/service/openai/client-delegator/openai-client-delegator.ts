import OpenAI from 'openai';
import { type Uploadable } from 'openai/uploads';

import { configManager } from '~/server/service/config-manager';

import type { IOpenaiClientDelegator } from './interfaces';


export class OpenaiClientDelegator implements IOpenaiClientDelegator {

  private client: OpenAI;

  constructor() {
    // Retrieve OpenAI related values from environment variables
    const apiKey = configManager.getConfig('crowi', 'app:openaiApiKey');

    const isValid = [apiKey].every(value => value != null);
    if (!isValid) {
      throw new Error("Environment variables required to use OpenAI's API are not set");
    }

    // initialize client
    this.client = new OpenAI({ apiKey });
  }

  async createVectorStore(): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    return this.client.beta.vectorStores.create({ name: 'growi-vector-store' });
  }

  async uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject> {
    return this.client.files.create({ file, purpose: 'assistants' });
  }

  async createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.create(vectorStoreId, { file_ids: fileIds });
  }

  async deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted> {
    return this.client.files.del(fileId);
  }

  async uploadAndPoll(vectorStoreId: string, files: Uploadable[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, { files });
  }

}
