import type OpenAI from 'openai';
import type { Uploadable } from 'openai/uploads';

export interface IOpenaiClientDelegator {
  createThread(vectorStoreId: string): Promise<OpenAI.Beta.Threads.Thread>
  retrieveThread(threadId: string): Promise<OpenAI.Beta.Threads.Thread>
  deleteThread(threadId: string): Promise<OpenAI.Beta.Threads.ThreadDeleted>
  getMessages(threadId: string, options?: { limit: number, before: string, after: string }): Promise<OpenAI.Beta.Threads.Messages.MessagesPage>
  retrieveVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStore>
  createVectorStore(name: string): Promise<OpenAI.Beta.VectorStores.VectorStore>
  deleteVectorStore(vectorStoreId: string): Promise<OpenAI.Beta.VectorStores.VectorStoreDeleted>
  uploadFile(file: Uploadable): Promise<OpenAI.Files.FileObject>
  createVectorStoreFileBatch(vectorStoreId: string, fileIds: string[]): Promise<OpenAI.Beta.VectorStores.FileBatches.VectorStoreFileBatch>
  deleteFile(fileId: string): Promise<OpenAI.Files.FileDeleted>;
  chatCompletion(body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming): Promise<OpenAI.Chat.Completions.ChatCompletion>
}
