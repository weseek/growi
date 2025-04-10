import { useCallback } from 'react';

import { SseMessageSchema, type SseMessage } from '~/features/openai/interfaces/knowledge-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

interface PostMessage {
  (aiAssistantId: string, threadId: string, userMessage: string, summaryMode?: boolean): Promise<Response>;
}
interface ProcessMessage {
  (data: unknown, handler: {
    onMessage: (data: SseMessage) => void}
  ): void;
}

export const useKnowledgeAssistant = (): { postMessage: PostMessage, processMessage: ProcessMessage } => {
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
    postMessage,
    processMessage,
  };
};
