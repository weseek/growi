import { useCallback, useMemo, useState } from 'react';

import { apiv3Post } from '~/client/util/apiv3-client';
import { SseMessageSchema, type SseMessage } from '~/features/openai/interfaces/knowledge-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

import type { IThreadRelationHasId } from '../../interfaces/thread-relation';
import { ThreadType } from '../../interfaces/thread-relation';
import { useAiAssistantSidebar } from '../stores/ai-assistant';

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

  // Views
  headerIcon: JSX.Element
  headerText: JSX.Element
  placeHolder: string
}

export const useKnowledgeAssistant: UseKnowledgeAssistant = () => {
  // Hooks
  const { data: aiAssistantSidebarData } = useAiAssistantSidebar();
  const { aiAssistantData } = aiAssistantSidebarData ?? {};
  const { threadData } = aiAssistantSidebarData ?? {};

  // States
  const [currentThreadTitle, setCurrentThreadId] = useState(threadData?.title);

  // Functions
  const createThread: CreateThread = useCallback(async(aiAssistantId, initialUserMessage) => {
    const response = await apiv3Post<IThreadRelationHasId>('/openai/thread', {
      type: ThreadType.KNOWLEDGE,
      aiAssistantId,
      initialUserMessage,
    });
    const thread = response.data;

    setCurrentThreadId(thread.title);

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

  // Views
  const headerIcon = useMemo(() => {
    return <span className="growi-custom-icons growi-ai-chat-icon me-3 fs-4">ai_assistant</span>;
  }, []);

  const headerText = useMemo(() => {
    return <>{currentThreadTitle ?? aiAssistantData?.name}</>;
  }, [aiAssistantData?.name, currentThreadTitle]);

  const placeHolder = useMemo(() => { return 'sidebar_ai_assistant.knowledge_assistant_placeholder' }, []);

  return {
    // Functions
    createThread,
    postMessage,
    processMessage,

    // Views
    headerIcon,
    headerText,
    placeHolder,
  };
};
