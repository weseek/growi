import { apiv3Post, apiv3Put, apiv3Delete } from '~/client/util/apiv3-client';

import type { UpsertAiAssistantData } from '../../interfaces/ai-assistant';

export const createAiAssistant = async(body: UpsertAiAssistantData): Promise<void> => {
  await apiv3Post('/openai/ai-assistant', body);
};

export const updateAiAssistant = async(id: string, body: UpsertAiAssistantData): Promise<void> => {
  await apiv3Put(`/openai/ai-assistant/${id}`, body);
};

export const setDefaultAiAssistant = async(id: string, isDefault: boolean): Promise<void> => {
  await apiv3Put(`/openai/ai-assistant/${id}/set-default`, { isDefault });
};

export const deleteAiAssistant = async(id: string): Promise<void> => {
  await apiv3Delete(`/openai/ai-assistant/${id}`);
};

export const postMessageForKnowledgeAssistant = async(
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

export const postMessageForEditorAssistant = async(threadId: string, userMessage: string, markdown: string, aiAssistantId?: string): Promise<Response> => {
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
