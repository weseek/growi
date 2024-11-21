import OpenAI from 'openai';
import { type Uploadable } from 'openai/uploads';

import type { VectorStoreScopeType } from '~/features/openai/server/models/vector-store';
import { configManager } from '~/server/service/config-manager';

import type { IOpenaiClientDelegator } from './interfaces';


export class OpenaiClientDelegator implements IOpenaiClientDelegator {

  private client: OpenAI;

  constructor() {
    // Retrieve OpenAI related values from environment variables
    const apiKey = configManager.getConfig('crowi', 'openai:apiKey');

    const isValid = [apiKey].every(value => value != null);
    if (!isValid) {
      throw new Error("Environment variables required to use OpenAI's API are not set");
    }

    // initialize client
    this.client = new OpenAI({ apiKey });
  }

  async createThread(vectorStoreId: string): Promise<OpenAI.Beta.Threads.Thread> {
    return this.client.beta.threads.create({
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId],
        },
      },
    });
  }

  async retrieveThread(threadId: string): Promise<OpenAI.Beta.Threads.Thread> {
    return this.client.beta.threads.retrieve(threadId);
  }

  async deleteThread(threadId: string): Promise<OpenAI.Beta.Threads.ThreadDeleted> {
    return this.client.beta.threads.del(threadId);
  }

  async createVectorStore(scopeType:VectorStoreScopeType): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    return this.client.beta.vectorStores.create({ name: `growi-vector-store-${scopeType}` });
  }

  async retrieveVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    return this.client.beta.vectorStores.retrieve(vectorStoreId);
  }

  async deleteVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStoreDeleted> {
    return this.client.beta.vectorStores.del(vectorStoreId);
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
