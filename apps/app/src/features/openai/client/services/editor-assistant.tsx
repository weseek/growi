import {
  useCallback, useEffect, useState, useRef, useMemo,
} from 'react';

import { GlobalCodeMirrorEditorKey } from '@growi/editor';
import {
  acceptAllChunks, useTextSelectionEffect,
} from '@growi/editor/dist/client/services/unified-merge-view';
import { useCodeMirrorEditorIsolated } from '@growi/editor/dist/client/stores/codemirror-editor';
import { useSecondaryYdocs } from '@growi/editor/dist/client/stores/use-secondary-ydocs';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type Text as YText } from 'yjs';

import { apiv3Post } from '~/client/util/apiv3-client';
import {
  SseMessageSchema,
  SseDetectedDiffSchema,
  SseFinalizedSchema,
  isReplaceDiff,
  type SseMessage,
  type SseDetectedDiff,
  type SseFinalized,
} from '~/features/openai/interfaces/editor-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';
import { useIsEnableUnifiedMergeView } from '~/stores-universal/context';
import { useCurrentPageId } from '~/stores/page';

import type { AiAssistantHasId } from '../../interfaces/ai-assistant';
import type { MessageLog } from '../../interfaces/message';
import type { IThreadRelationHasId } from '../../interfaces/thread-relation';
import { ThreadType } from '../../interfaces/thread-relation';
import { AiAssistantDropdown } from '../components/AiAssistant/AiAssistantSidebar/AiAssistantDropdown';
import { MessageCard, type MessageCardRole } from '../components/AiAssistant/AiAssistantSidebar/MessageCard';
import { QuickMenuList } from '../components/AiAssistant/AiAssistantSidebar/QuickMenuList';
import { useAiAssistantSidebar } from '../stores/ai-assistant';

interface CreateThread {
  (): Promise<IThreadRelationHasId>;
}
interface PostMessage {
  (threadId: string, formData: FormData): Promise<Response>;
}
interface ProcessMessage {
  (data: unknown, handler: {
    onMessage: (data: SseMessage) => void;
    onDetectedDiff: (data: SseDetectedDiff) => void;
    onFinalized: (data: SseFinalized) => void;
  }): void;
}

interface GenerateInitialView {
  (onSubmit: (data: FormData) => Promise<void>): JSX.Element;
}
interface GenerateMessageCard {
  (role: MessageCardRole, children: string, messageId: string, messageLogs: MessageLog[], generatingAnswerMessage?: MessageLog): JSX.Element;
}
export interface FormData {
  input: string,
  markdownType?: 'full' | 'selected' | 'none'
}

type DetectedDiff = Array<{
  data: SseDetectedDiff,
  applied: boolean,
  id: string,
}>

type UseEditorAssistant = () => {
  createThread: CreateThread,
  postMessage: PostMessage,
  processMessage: ProcessMessage,
  form: UseFormReturn<FormData>
  resetForm: () => void
  isTextSelected: boolean,
  isGeneratingEditorText: boolean,

  // Views
  generateInitialView: GenerateInitialView,
  generateMessageCard: GenerateMessageCard,
  headerIcon: JSX.Element,
  headerText: JSX.Element,
  placeHolder: string,
}

const insertTextAtLine = (yText: YText, lineNumber: number, textToInsert: string): void => {
  // Get the entire text content
  const content = yText.toString();

  // Split by newlines to get all lines
  const lines = content.split('\n');

  // Calculate the index position for insertion
  let insertPosition = 0;

  // Sum the length of all lines before the target line (plus newline characters)
  for (let i = 0; i < lineNumber && i < lines.length; i++) {
    insertPosition += lines[i].length + 1; // +1 for the newline character
  }

  // Insert the text at the calculated position
  yText.insert(insertPosition, textToInsert);
};

const appendTextLastLine = (yText: YText, textToAppend: string) => {
  const content = yText.toString();
  const insertPosition = content.length;
  yText.insert(insertPosition, `\n\n${textToAppend}`);
};

const getLineInfo = (yText: YText, lineNumber: number): { text: string, startIndex: number } | null => {
  // Get the entire text content
  const content = yText.toString();

  // Split by newlines to get all lines
  const lines = content.split('\n');

  // Check if the requested line exists
  if (lineNumber < 0 || lineNumber >= lines.length) {
    return null; // Line doesn't exist
  }

  // Get the text of the specified line
  const text = lines[lineNumber];

  // Calculate the start index of the line
  let startIndex = 0;
  for (let i = 0; i < lineNumber; i++) {
    startIndex += lines[i].length + 1; // +1 for the newline character
  }

  // Return comprehensive line information
  return {
    text,
    startIndex,
  };
};

export const useEditorAssistant: UseEditorAssistant = () => {
  // Refs
  const lineRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States
  const [detectedDiff, setDetectedDiff] = useState<DetectedDiff>();
  const [selectedAiAssistant, setSelectedAiAssistant] = useState<AiAssistantHasId>();
  const [selectedText, setSelectedText] = useState<string>();
  const [isGeneratingEditorText, setIsGeneratingEditorText] = useState<boolean>(false);

  const isTextSelected = useMemo(() => selectedText != null && selectedText.length !== 0, [selectedText]);

  // Hooks
  const { t } = useTranslation();
  const { data: currentPageId } = useCurrentPageId();
  const { data: isEnableUnifiedMergeView, mutate: mutateIsEnableUnifiedMergeView } = useIsEnableUnifiedMergeView();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const yDocs = useSecondaryYdocs(isEnableUnifiedMergeView ?? false, { pageId: currentPageId ?? undefined, useSecondary: isEnableUnifiedMergeView ?? false });
  const { data: aiAssistantSidebarData } = useAiAssistantSidebar();

  const form = useForm<FormData>({
    defaultValues: {
      input: '',
    },
  });

  // Functions
  const resetForm = useCallback(() => {
    form.reset({ input: '' });
  }, [form]);

  const createThread: CreateThread = useCallback(async() => {
    const response = await apiv3Post<IThreadRelationHasId>('/openai/thread', {
      type: ThreadType.EDITOR,
      aiAssistantId: selectedAiAssistant?._id,
    });
    return response.data;
  }, [selectedAiAssistant?._id]);

  const postMessage: PostMessage = useCallback(async(threadId, formData) => {
    const getMarkdown = (): string | undefined => {
      if (formData.markdownType === 'none') {
        return undefined;
      }

      if (formData.markdownType === 'selected') {
        return selectedText;
      }

      if (formData.markdownType === 'full') {
        return codeMirrorEditor?.getDoc();
      }
    };

    // Disable UnifiedMergeView when a Form is submitted with UnifiedMergeView enabled
    mutateIsEnableUnifiedMergeView(false);

    const response = await fetch('/_api/v3/openai/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threadId,
        userMessage: formData.input,
        markdown: getMarkdown(),
      }),
    });

    return response;
  }, [codeMirrorEditor, mutateIsEnableUnifiedMergeView, selectedText]);

  const processMessage: ProcessMessage = useCallback((data, handler) => {
    // Reset timer whenever data is received
    const handleDataReceived = () => {
    // Clear existing timer
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }

      // Hide spinner since data is flowing
      if (isGeneratingEditorText) {
        setIsGeneratingEditorText(false);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        setIsGeneratingEditorText(true);
      }, 500);
    };

    handleIfSuccessfullyParsed(data, SseMessageSchema, (data: SseMessage) => {
      handler.onMessage(data);
      handleDataReceived();
    });
    handleIfSuccessfullyParsed(data, SseDetectedDiffSchema, (data: SseDetectedDiff) => {
      handleDataReceived();
      mutateIsEnableUnifiedMergeView(true);
      setDetectedDiff((prev) => {
        const newData = { data, applied: false, id: crypto.randomUUID() };
        if (prev == null) {
          return [newData];
        }
        return [...prev, newData];
      });
      handler.onDetectedDiff(data);
    });
    handleIfSuccessfullyParsed(data, SseFinalizedSchema, (data: SseFinalized) => {
      handler.onFinalized(data);
    });
  }, [isGeneratingEditorText, mutateIsEnableUnifiedMergeView]);

  const selectTextHandler = useCallback((selectedText: string, selectedTextFirstLineNumber: number) => {
    setSelectedText(selectedText);
    lineRef.current = selectedTextFirstLineNumber;
  }, []);


  // Effects
  useTextSelectionEffect(codeMirrorEditor, selectTextHandler);

  useEffect(() => {
    const pendingDetectedDiff: DetectedDiff | undefined = detectedDiff?.filter(diff => diff.applied === false);
    if (yDocs?.secondaryDoc != null && pendingDetectedDiff != null && pendingDetectedDiff.length > 0) {
      const yText = yDocs.secondaryDoc.getText('codemirror');
      yDocs.secondaryDoc.transact(() => {
        pendingDetectedDiff.forEach((detectedDiff) => {
          if (isReplaceDiff(detectedDiff.data)) {

            if (isTextSelected) {
              const lineInfo = getLineInfo(yText, lineRef.current);
              if (lineInfo != null && lineInfo.text !== detectedDiff.data.diff.replace) {
                yText.delete(lineInfo.startIndex, lineInfo.text.length);
                insertTextAtLine(yText, lineRef.current, detectedDiff.data.diff.replace);
              }

              lineRef.current += 1;
            }
            else {
              appendTextLastLine(yText, detectedDiff.data.diff.replace);
            }
          }
        });
      });

      // Mark items as applied after applying to secondaryDoc
      setDetectedDiff((prev) => {
        if (!prev) return prev;
        const pendingDetectedDiffIds = pendingDetectedDiff.map(diff => diff.id);
        return prev.map((diff) => {
          if (pendingDetectedDiffIds.includes(diff.id)) {
            return { ...diff, applied: true };
          }
          return diff;
        });
      });
    }
  }, [codeMirrorEditor, detectedDiff, isTextSelected, selectedText, yDocs?.secondaryDoc]);

  // Set detectedDiff to undefined after applying all detectedDiff to secondaryDoc
  useEffect(() => {
    if (detectedDiff?.filter(detectedDiff => detectedDiff.applied === false).length === 0) {
      setSelectedText(undefined);
      setDetectedDiff(undefined);
      lineRef.current = 0;
    }
  }, [detectedDiff]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);


  // Views
  const headerIcon = useMemo(() => {
    return <span className="material-symbols-outlined growi-ai-chat-icon me-3 fs-4">support_agent</span>;
  }, []);

  const headerText = useMemo(() => {
    return <>{t('Editor Assistant')}</>;
  }, [t]);

  const placeHolder = useMemo(() => { return 'sidebar_ai_assistant.editor_assistant_placeholder' }, []);

  const generateInitialView: GenerateInitialView = useCallback((onSubmit) => {
    const selectAiAssistantHandler = (aiAssistant?: AiAssistantHasId) => {
      setSelectedAiAssistant(aiAssistant);
    };

    const clickQuickMenuHandler = async(quickMenu: string) => {
      await onSubmit({ input: quickMenu, markdownType: 'full' });
    };

    return (
      <>
        <div className="py-2">
          <AiAssistantDropdown
            selectedAiAssistant={selectedAiAssistant}
            onSelect={selectAiAssistantHandler}
          />
        </div>
        <QuickMenuList
          onClick={clickQuickMenuHandler}
        />
      </>
    );
  }, [selectedAiAssistant]);


  const generateMessageCard: GenerateMessageCard = useCallback((role, children, messageId, messageLogs, generatingAnswerMessage) => {
    const isActionButtonShown = (() => {
      if (!aiAssistantSidebarData?.isEditorAssistant) {
        return false;
      }

      if (!isEnableUnifiedMergeView) {
        return false;
      }

      if (generatingAnswerMessage != null) {
        return false;
      }

      const latestAssistantMessageLogId = messageLogs
        .filter(message => !message.isUserMessage)
        .slice(-1)[0];

      if (messageId === latestAssistantMessageLogId?.id) {
        return true;
      }

      return false;
    })();


    const accept = () => {
      if (codeMirrorEditor?.view == null) {
        return;
      }

      acceptAllChunks(codeMirrorEditor.view);
      mutateIsEnableUnifiedMergeView(false);
    };

    const reject = () => {
      mutateIsEnableUnifiedMergeView(false);
    };

    return (
      <MessageCard
        role={role}
        showActionButtons={isActionButtonShown}
        onAccept={accept}
        onDiscard={reject}
      >
        {children}
      </MessageCard>
    );
  }, [aiAssistantSidebarData?.isEditorAssistant, codeMirrorEditor?.view, isEnableUnifiedMergeView, mutateIsEnableUnifiedMergeView]);

  return {
    createThread,
    postMessage,
    processMessage,
    form,
    resetForm,
    isTextSelected,
    isGeneratingEditorText,

    // Views
    generateInitialView,
    generateMessageCard,
    headerIcon,
    headerText,
    placeHolder,
  };
};

// type guard
export const isEditorAssistantFormData = (formData): formData is FormData => {
  return 'markdownType' in formData;
};
