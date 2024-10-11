import OpenAI from 'openai';
import { type Uploadable } from 'openai/uploads';

import { configManager } from '~/server/service/config-manager';

import type { IOpenaiClientDelegator } from './interfaces';


export class OpenaiClientDelegator implements IOpenaiClientDelegator {

  private client: OpenAI;

  private openaiVectorStoreId: string;

  constructor() {
    // Retrieve OpenAI related values from environment variables
    const apiKey = configManager.getConfig('crowi', 'openai:projectApiKey');
    const vectorStoreId = configManager.getConfig('crowi', 'openai:vectorStoreId');

    const isValid = [apiKey, vectorStoreId].every(value => value != null);
    if (!isValid) {
      throw new Error("Environment variables required to use OpenAI's API are not set");
    }

    this.openaiVectorStoreId = vectorStoreId;

    // initialize client
    this.client = new OpenAI({ apiKey });
  }

  async uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject> {
    return this.client.files.create({ file, purpose: 'assistants' });
  }

  async createVectorStoreFileBatch(fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.create(this.openaiVectorStoreId, { file_ids: fileIds });
  }

  async getVectorStoreFiles(): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFilesPage> {
    return this.client.beta.vectorStores.files.list(this.openaiVectorStoreId);
  }

  async deleteVectorStoreFiles(fileId: string): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFileDeleted> {
    return this.client.beta.vectorStores.files.del(this.openaiVectorStoreId, fileId);
  }

  async getFileList(): Promise<OpenAI.Files.FileObjectsPage> {
    return this.client.files.list();
  }

  async deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted> {
    return this.client.files.del(fileId);
  }

  async uploadAndPoll(files: Uploadable[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.uploadAndPoll(this.openaiVectorStoreId, { files });
  }

}
