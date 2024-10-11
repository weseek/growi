import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import type OpenAI from 'openai';
import { AzureOpenAI } from 'openai';
import { type Uploadable } from 'openai/uploads';

import type { IOpenaiClientDelegator } from './interfaces';


export class AzureOpenaiClientDelegator implements IOpenaiClientDelegator {

  private client: AzureOpenAI;

  private openaiVectorStoreId: string;

  constructor() {
    // Retrieve Azure OpenAI related values from environment variables
    const credential = new DefaultAzureCredential();
    const scope = 'https://cognitiveservices.azure.com/.default';
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    this.client = new AzureOpenAI({ azureADTokenProvider });

    // TODO: initialize openaiVectorStoreId property
  }

  async uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject> {
    return this.client.files.create({ file, purpose: 'assistants' });
  }

  async createVectorStoreFileBatch(fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.create(this.openaiVectorStoreId, { file_ids: fileIds });
  }

  async getFileList(): Promise<OpenAI.Files.FileObjectsPage> {
    return this.client.files.list();
  }

  async getVectorStoreFiles(): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFilesPage> {
    return this.client.beta.vectorStores.files.list(this.openaiVectorStoreId);
  }

  async deleteVectorStoreFiles(fileId: string): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFileDeleted> {
    return this.client.beta.vectorStores.files.del(this.openaiVectorStoreId, fileId);
  }

  async deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted> {
    return this.client.files.del(fileId);
  }

  async uploadAndPoll(files: Uploadable[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.uploadAndPoll(this.openaiVectorStoreId, { files });
  }

}
