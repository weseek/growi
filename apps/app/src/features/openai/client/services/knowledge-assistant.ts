import { SseMessageSchema, type SseMessage } from '~/features/openai/interfaces/knowledge-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

export const postMessage = async(
    aiAssistantId: string, threadId: string, userMessage: string, summaryMode?: boolean,
): Promise<Response> => {
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
};

export const processMessage = (data: unknown,
    handler: {onMessage: (data: SseMessage) => void}) : void => {
  handleIfSuccessfullyParsed(data, SseMessageSchema, (data: SseMessage) => {
    handler.onMessage(data);
  });
};
