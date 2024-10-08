import type OpenAI from 'openai';
import type { Uploadable } from 'openai/uploads';

export interface IOpenaiClientDelegator {
  createVectorStore(): Promise<OpenAI.Beta.VectorStores.VectorStore>
  uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject>
  createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch>
  deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted>;
}
