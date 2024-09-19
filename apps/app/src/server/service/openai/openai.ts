import OpenaiClient from './openai-client-delegator';

export interface IOpenaiService {
  rebuildVectorStore(): Promise<void>;
}
class OpenaiService implements IOpenaiService {

  private client: OpenaiClient;

  constructor() {
    this.client = new OpenaiClient();
  }

  async rebuildVectorStore() {
    // Delete an existing VectorStoreFile
    const vectorStoreFileData = await this.client.getVectorStoreFiles();
    const vectorStoreFiles = vectorStoreFileData?.data;
    if (vectorStoreFiles != null && vectorStoreFiles.length > 0) {
      vectorStoreFiles.forEach(async(vectorStoreFile) => {
        await this.client.deleteVectorStoreFiles(vectorStoreFile.id);
      });
    }

    // Create all public pages VectorStoreFile
    // TODO: https://redmine.weseek.co.jp/issues/153988

  }

}

export const openaiService = new OpenaiService();
