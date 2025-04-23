import { useCallback } from 'react';

import { apiv3Post } from '~/client/util/apiv3-client';
import { SseMessageSchema, type SseMessage } from '~/features/openai/interfaces/knowledge-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

import type { IThreadRelationHasId } from '../../interfaces/thread-relation';
import { ThreadType } from '../../interfaces/thread-relation';

interface CreateThread {
  (aiAssistantId: string, initialUserMessage: string): Promise<IThreadRelationHasId>;
}

interface PostMessage {
  (aiAssistantId: string, threadId: string, userMessage: string, summaryMode?: boolean): Promise<Response>;
}

interface ProcessMessage {
  (data: unknown, handler: {
    onMessage: (data: SseMessage) => void}
  ): void;
}

type UseKnowledgeAssistant = () => {
  createThread: CreateThread
  postMessage: PostMessage
  processMessage: ProcessMessage
}

export const useKnowledgeAssistant: UseKnowledgeAssistant = () => {

  const createThread: CreateThread = useCallback(async(aiAssistantId, initialUserMessage) => {
    const response = await apiv3Post<IThreadRelationHasId>('/openai/thread', {
      type: ThreadType.KNOWLEDGE,
      aiAssistantId,
      initialUserMessage,
    });
    const thread = response.data;
    return thread;
  }, []);

  const postMessage: PostMessage = useCallback(async(aiAssistantId, threadId, userMessage, summaryMode) => {
    const response = await fetch('/_api/v3/openai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiAssistantId,
        threadId,
        userMessage,
        summaryMode,
      }),
    });
    return response;
  }, []);

  const processMessage: ProcessMessage = useCallback((data, handler) => {
    handleIfSuccessfullyParsed(data, SseMessageSchema, (data: SseMessage) => {
      handler.onMessage(data);
    });
  }, []);

  return {
    createThread,
    postMessage,
    processMessage,
  };
};
