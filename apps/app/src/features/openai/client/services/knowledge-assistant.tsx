import type { Dispatch, SetStateAction } from 'react';
import {
  useCallback, useMemo, useState, useEffect,
} from 'react';

import { apiv3Post } from '~/client/util/apiv3-client';
import { SseMessageSchema, type SseMessage } from '~/features/openai/interfaces/knowledge-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

import type { MessageLog } from '../../interfaces/message';
import type { IThreadRelationHasId } from '../../interfaces/thread-relation';
import { ThreadType } from '../../interfaces/thread-relation';
import { AiAssistantChatInitialView } from '../components/AiAssistant/AiAssistantSidebar/AiAssistantChatInitialView';
import { useAiAssistantSidebar } from '../stores/ai-assistant';
import { useSWRMUTxMessages } from '../stores/message';
import { useSWRMUTxThreads } from '../stores/thread';

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
  initialView: JSX.Element
  headerIcon: JSX.Element
  headerText: JSX.Element
  placeHolder: string
}

export const useKnowledgeAssistant: UseKnowledgeAssistant = () => {
  // Hooks
  const { data: aiAssistantSidebarData } = useAiAssistantSidebar();
  const { aiAssistantData } = aiAssistantSidebarData ?? {};
  const { threadData } = aiAssistantSidebarData ?? {};
  const { trigger: mutateThreadData } = useSWRMUTxThreads(aiAssistantData?._id);

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

    // No need to await because data is not used
    mutateThreadData();

    return thread;
  }, [mutateThreadData]);

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

  const initialView = useMemo(() => {
    if (aiAssistantSidebarData?.aiAssistantData == null) {
      return <></>;
    }

    return (
      <AiAssistantChatInitialView
        description={aiAssistantSidebarData.aiAssistantData.description}
        additionalInstruction={aiAssistantSidebarData.aiAssistantData.additionalInstruction}
        pagePathPatterns={aiAssistantSidebarData.aiAssistantData.pagePathPatterns}
      />
    );
  }, [aiAssistantSidebarData?.aiAssistantData]);

  return {
    // Functions
    createThread,
    postMessage,
    processMessage,

    // Views
    initialView,
    headerIcon,
    headerText,
    placeHolder,
  };
};


export const useFetchAndSetMessageDataEffect = (setMessageLogs: Dispatch<SetStateAction<MessageLog[]>>, threadId?: string): void => {
  const { data: aiAssistantSidebarData } = useAiAssistantSidebar();
  const { trigger: mutateMessageData } = useSWRMUTxMessages(aiAssistantSidebarData?.aiAssistantData?._id, threadId);

  useEffect(() => {
    const fetchAndSetMessageData = async() => {
      const messageData = await mutateMessageData();
      if (messageData != null) {
        const normalizedMessageData = messageData.data
          .reverse()
          .filter(message => message.metadata?.shouldHideMessage !== 'true');

        setMessageLogs(() => {
          return normalizedMessageData.map((message, index) => (
            {
              id: index.toString(),
              content: message.content[0].type === 'text' ? message.content[0].text.value : '',
              isUserMessage: message.role === 'user',
            }
          ));
        });
      }
    };

    if (threadId != null) {
      fetchAndSetMessageData();
    }

  }, [mutateMessageData, setMessageLogs, threadId]);
};
