import {
  SseMessageSchema,
  SseDetectedDiffSchema,
  SseFinalizedSchema,
  type SseMessage,
  type SseDetectedDiff,
  type SseFinalized,
} from '~/features/openai/interfaces/editor-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

export const postMessage = async(threadId: string, userMessage: string, markdown: string, aiAssistantId?: string): Promise<Response> => {
  const response = await fetch('/_api/v3/openai/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aiAssistantId,
      threadId,
      userMessage,
      markdown,
    }),
  });

  return response;
};

export const processMessage = (data: unknown, handler: {
  onMessage: (data: SseMessage) => void,
  onDetectedDiff: (data: SseDetectedDiff) => void,
  onFinalized: (data: SseFinalized) => void,
}): void => {
  handleIfSuccessfullyParsed(data, SseMessageSchema, (data: SseMessage) => {
    handler.onMessage(data);
  });
  handleIfSuccessfullyParsed(data, SseDetectedDiffSchema, (data: SseDetectedDiff) => {
    handler.onDetectedDiff(data);
  });
  handleIfSuccessfullyParsed(data, SseFinalizedSchema, (data: SseFinalized) => {
    handler.onFinalized(data);
  });
};
