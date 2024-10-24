import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import type OpenAI from 'openai';
import { AzureOpenAI } from 'openai';
import { type Uploadable } from 'openai/uploads';

import type { VectorStoreScopeType } from '~/features/openai/server/models/vector-store';

import type { IOpenaiClientDelegator } from './interfaces';


export class AzureOpenaiClientDelegator implements IOpenaiClientDelegator {

  private client: AzureOpenAI;

  constructor() {
    // Retrieve Azure OpenAI related values from environment variables
    const credential = new DefaultAzureCredential();
    const scope = 'https://cognitiveservices.azure.com/.default';
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    this.client = new AzureOpenAI({ azureADTokenProvider });

    // TODO: initialize openaiVectorStoreId property
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
    return this.client.beta.vectorStores.create({ name: `growi-vector-store-{${scopeType}` });
  }

  async retrieveVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    return this.client.beta.vectorStores.retrieve(vectorStoreId);
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
