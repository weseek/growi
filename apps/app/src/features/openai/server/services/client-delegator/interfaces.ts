import type OpenAI from 'openai';
import type { Uploadable } from 'openai/uploads';

import type { MessageListParams } from '../../../interfaces/message';

export interface IOpenaiClientDelegator {
  createThread(vectorStoreId?: string): Promise<OpenAI.Beta.Threads.Thread>
  updateThread(threadId: string, vectorStoreId: string): Promise<OpenAI.Beta.Threads.Thread>
  retrieveThread(threadId: string): Promise<OpenAI.Beta.Threads.Thread>
  deleteThread(threadId: string): Promise<OpenAI.Beta.Threads.ThreadDeleted>
  getMessages(threadId: string, options?: MessageListParams): Promise<OpenAI.Beta.Threads.Messages.MessagesPage>
  retrieveVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStore>
  createVectorStore(name: string): Promise<OpenAI.Beta.VectorStores.VectorStore>
  deleteVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStoreDeleted>
  uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject>
  createVectorStoreFile(vectorStoreId: string, fileId: string): Promise<OpenAI.Beta.VectorStores.Files.VectorStoreFile>
  createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch>
  deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted>;
  chatCompletion(body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming): Promise<OpenAI.Chat.Completions.ChatCompletion>
}
