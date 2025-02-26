import type OpenAI from 'openai';

export type MessageWithCustomMetaData = Omit<OpenAI.Beta.Threads.Messages.MessagesPage, 'data'> & {
  data: Array<OpenAI.Beta.Threads.Message & {
    metadata?: {
      shouldHideMessage?: 'true' | 'false',
    }
  }>;
};
