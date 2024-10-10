import type OpenAI from 'openai';
import type { Uploadable } from 'openai/uploads';

import type { VectorStoreScopeType } from '~/features/openai/server/models/vector-store';

export interface IOpenaiClientDelegator {
  createVectorStore(scopeType:VectorStoreScopeType): Promise<OpenAI.Beta.VectorStores.VectorStore>
  uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject>
  createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch>
  deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted>;
}
