import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import OpenAI, { AzureOpenAI } from 'openai';
import { type Uploadable } from 'openai/uploads';

import { aiServiceType as serviceType, aiServiceTypes } from '~/interfaces/ai';
import { configManager } from '~/server/service/config-manager';

export default class OpenaiClient {

  private client: OpenAI | AzureOpenAI;

  private isOpenai: boolean;

  private openaiVectorStoreId: string;

  constructor() {
    const aiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
    const aiServiceType = configManager.getConfig('crowi', 'app:aiServiceType');

    if (!aiEnabled) {
      throw new Error('AI_ENABLED is not true');
    }

    if (aiServiceType == null || !aiServiceTypes.includes(aiServiceType)) {
      throw new Error('AI_SERVICE_TYPE is missing or contains an invalid value');
    }

    this.isOpenai = aiServiceType === serviceType.OPEN_AI;

    // Retrieve OpenAI related values from environment variables
    if (this.isOpenai) {
      const apiKey = configManager.getConfig('crowi', 'app:openaiApiKey');
      const vectorStoreId = configManager.getConfig('crowi', 'app:openaiVectorStoreId');

      const isValid = [apiKey, vectorStoreId].every(value => value != null);
      if (!isValid) {
        throw new Error("Environment variables required to use OpenAI's API are not set");
      }

      this.openaiVectorStoreId = vectorStoreId;

      // initialize client
      this.client = new OpenAI({ apiKey });
    }

    // Retrieve Azure OpenAI related values from environment variables
    else {
      const credential = new DefaultAzureCredential();
      const scope = 'https://cognitiveservices.azure.com/.default';
      const azureADTokenProvider = getBearerTokenProvider(credential, scope);
      this.client = new AzureOpenAI({ azureADTokenProvider });
    }
  }

  async getVectorStoreFiles(): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFilesPage> {
    return this.client.beta.vectorStores.files.list(this.openaiVectorStoreId);
  }

  async deleteVectorStoreFiles(fileId: string): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFileDeleted> {
    return this.client.beta.vectorStores.files.del(this.openaiVectorStoreId, fileId);
  }

  async uploadAndPoll(files: Uploadable[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch> {
    return this.client.beta.vectorStores.fileBatches.uploadAndPoll(this.openaiVectorStoreId, { files });
  }

}
