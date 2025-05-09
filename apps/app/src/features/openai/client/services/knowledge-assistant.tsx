import type { Dispatch, SetStateAction, RefObject } from 'react';
import {
  useCallback, useMemo, useState, useEffect,
} from 'react';

import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { SseMessageSchema, type SseMessage } from '~/features/openai/interfaces/knowledge-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';

import type { MessageLog } from '../../interfaces/message';
import type { IThreadRelationHasId } from '../../interfaces/thread-relation';
import { ThreadType } from '../../interfaces/thread-relation';
import { AiAssistantChatInitialView } from '../components/AiAssistant/AiAssistantSidebar/AiAssistantChatInitialView';
import { MessageCard, type MessageCardRole } from '../components/AiAssistant/AiAssistantSidebar/MessageCard';
import { useAiAssistantSidebar } from '../stores/ai-assistant';
import { useSWRMUTxMessages } from '../stores/message';
import { useSWRMUTxThreads } from '../stores/thread';

interface CreateThread {
  (aiAssistantId: string, initialUserMessage: string): Promise<IThreadRelationHasId>;
}

interface PostMessage {
  (aiAssistantId: string, threadId: string, formData: FormData): Promise<Response>;
}

interface ProcessMessage {
  (data: unknown, handler: {
    onMessage: (data: SseMessage) => void}
  ): void;
}

interface GenerateMessageCard {
  (role: MessageCardRole, children: string): JSX.Element;
}

interface GenerateSummaryModeSwitch {
  (isGenerating: boolean): JSX.Element
}

export interface FormData {
  input: string
  summaryMode?: boolean
}

type UseKnowledgeAssistant = () => {
  createThread: CreateThread
  postMessage: PostMessage
  processMessage: ProcessMessage
  form: UseFormReturn<FormData>
  resetForm: () => void

  // Views
  initialView: JSX.Element
  generateMessageCard: GenerateMessageCard
  generateSummaryModeSwitch: GenerateSummaryModeSwitch
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
  const { t } = useTranslation();

  const form = useForm<FormData>({
    defaultValues: {
      input: '',
      summaryMode: true,
    },
  });

  // States
  const [currentThreadTitle, setCurrentThreadId] = useState(threadData?.title);

  // Functions
  const resetForm = useCallback(() => {
    const summaryMode = form.getValues('summaryMode');
    form.reset({ input: '', summaryMode });
  }, [form]);

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

  const postMessage: PostMessage = useCallback(async(aiAssistantId, threadId, formData) => {
    const response = await fetch('/_api/v3/openai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiAssistantId,
        threadId,
        userMessage: formData.input,
        summaryMode: form.getValues('summaryMode'),
      }),
    });
    return response;
  }, [form]);

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
        pagePathPatterns={aiAssistantSidebarData.aiAssistantData.pagePathPatterns}
      />
    );
  }, [aiAssistantSidebarData?.aiAssistantData]);

  const generateMessageCard: GenerateMessageCard = useCallback((role, children) => {
    return (
      <MessageCard
        role={role}
      >
        {children}
      </MessageCard>
    );
  }, []);

  const generateSummaryModeSwitch: GenerateSummaryModeSwitch = useCallback((isGenerating) => {
    return (
      <div className="form-check form-switch">
        <input
          id="swSummaryMode"
          type="checkbox"
          role="switch"
          className="form-check-input"
          {...form.register('summaryMode')}
          disabled={form.formState.isSubmitting || isGenerating}
        />
        <label className="form-check-label" htmlFor="swSummaryMode">
          {t('sidebar_ai_assistant.summary_mode_label')}
        </label>

        {/* Help */}
        <a
          id="tooltipForHelpOfSummaryMode"
          role="button"
          className="ms-1"
        >
          <span className="material-symbols-outlined fs-6" style={{ lineHeight: 'unset' }}>help</span>
        </a>
        <UncontrolledTooltip
          target="tooltipForHelpOfSummaryMode"
        >
          {t('sidebar_ai_assistant.summary_mode_help')}
        </UncontrolledTooltip>
      </div>
    );
  }, [form, t]);

  return {
    createThread,
    postMessage,
    processMessage,
    form,
    resetForm,

    // Views
    initialView,
    generateMessageCard,
    generateSummaryModeSwitch,
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

export const useAiAssistantSidebarCloseEffect = (sidebarRef: RefObject<HTMLDivElement>): void => {
  const { data, close } = useAiAssistantSidebar();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (data?.isOpened && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && !data.isEditorAssistant) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close, data?.isEditorAssistant, data?.isOpened, sidebarRef]);
};
