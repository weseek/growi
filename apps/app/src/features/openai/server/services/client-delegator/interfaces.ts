import type OpenAI from 'openai';
import type { Uploadable } from 'openai/uploads';

import type { VectorStoreScopeType } from '~/features/openai/server/models/vector-store';

export interface IOpenaiClientDelegator {
  createThread(vectorStoreId: string): Promise<OpenAI.Beta.Threads.Thread>
  retrieveThread(threadId: string): Promise<OpenAI.Beta.Threads.Thread>
  deleteThread(threadId: string): Promise<OpenAI.Beta.Threads.ThreadDeleted>
  retrieveVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStore>
  createVectorStore(scopeType:VectorStoreScopeType): Promise<OpenAI.Beta.VectorStores.VectorStore>
  deleteVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStoreDeleted>
  uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject>
  createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch>
  deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted>;
}
