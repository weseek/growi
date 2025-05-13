import type { KeyboardEvent, JSX } from 'react';
import {
  type FC, memo, useRef, useEffect, useState, useCallback, useMemo,
} from 'react';

import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';
import SimpleBar from 'simplebar-react';

import { toastError } from '~/client/util/toastr';
import { useGrowiCloudUri, useIsEnableUnifiedMergeView } from '~/stores-universal/context';
import loggerFactory from '~/utils/logger';

import type { AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import type { MessageLog } from '../../../../interfaces/message';
import { MessageErrorCode, StreamErrorCode } from '../../../../interfaces/message-error';
import type { IThreadRelationHasId } from '../../../../interfaces/thread-relation';
import {
  useEditorAssistant,
  useAiAssistantSidebarCloseEffect as useAiAssistantSidebarCloseEffectForEditorAssistant,
  isEditorAssistantFormData,
  type FormData as FormDataForEditorAssistant,
} from '../../../services/editor-assistant';
import {
  useKnowledgeAssistant,
  useFetchAndSetMessageDataEffect,
  useAiAssistantSidebarCloseEffect as useAiAssistantSidebarCloseEffectForKnowledgeAssistant,
  type FormData as FormDataForKnowledgeAssistant,
} from '../../../services/knowledge-assistant';
import { useAiAssistantSidebar } from '../../../stores/ai-assistant';
// import { useSWRxThreads } from '../../../stores/thread'; // 削除

import { MessageCard, type MessageCardRole } from './MessageCard';
import { ResizableTextarea } from './ResizableTextArea';

import styles from './AiAssistantSidebar.module.scss';

const logger = loggerFactory('growi:openai:client:components:AiAssistantSidebar');

const moduleClass = styles['grw-ai-assistant-sidebar'] ?? '';

type FormData = FormDataForEditorAssistant | FormDataForKnowledgeAssistant;

type AiAssistantSidebarSubstanceProps = {
  isEditorAssistant: boolean;
  aiAssistantData?: AiAssistantHasId;
  threadData?: IThreadRelationHasId;
  closeAiAssistantSidebar: () => void
}

const AiAssistantSidebarSubstance: React.FC<AiAssistantSidebarSubstanceProps> = (props: AiAssistantSidebarSubstanceProps) => {
  const {
    isEditorAssistant,
    aiAssistantData,
    threadData,
    closeAiAssistantSidebar,
  } = props;

  // States
  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(threadData?.threadId);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [generatingAnswerMessage, setGeneratingAnswerMessage] = useState<MessageLog>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isErrorDetailCollapsed, setIsErrorDetailCollapsed] = useState<boolean>(false);

  // Hooks
  const { t } = useTranslation();
  const { data: growiCloudUri } = useGrowiCloudUri();
  // const { data: threads, isLoading: isLoadingThreads } = useSWRxThreads(aiAssistantData?._id); // 削除
  const { data: aiAssistantSidebarData, refreshCurrentThreadData } = useAiAssistantSidebar(); // refreshCurrentThreadData を追加

  const {
    createThread: createThreadForKnowledgeAssistant,
    postMessage: postMessageForKnowledgeAssistant,
    processMessage: processMessageForKnowledgeAssistant,
    form: formForKnowledgeAssistant,
    resetForm: resetFormForKnowledgeAssistant,

    // Views
    initialView: initialViewForKnowledgeAssistant,
    generateMessageCard: generateMessageCardForKnowledgeAssistant,
    generateModeSwitchesDropdown: generateModeSwitchesDropdownForKnowledgeAssistant,
    headerIcon: headerIconForKnowledgeAssistant,
    headerText: headerTextForKnowledgeAssistant,
    placeHolder: placeHolderForKnowledgeAssistant,
  } = useKnowledgeAssistant();

  const {
    createThread: createThreadForEditorAssistant,
    postMessage: postMessageForEditorAssistant,
    processMessage: processMessageForEditorAssistant,
    form: formForEditorAssistant,
    resetForm: resetFormEditorAssistant,
    isTextSelected,

    // Views
    generateInitialView: generateInitialViewForEditorAssistant,
    generateMessageCard: generateMessageCardForEditorAssistant,
    headerIcon: headerIconForEditorAssistant,
    headerText: headerTextForEditorAssistant,
    placeHolder: placeHolderForEditorAssistant,
  } = useEditorAssistant();

  const form = isEditorAssistant ? formForEditorAssistant : formForKnowledgeAssistant;

  // Effects
  useFetchAndSetMessageDataEffect(setMessageLogs, threadData?.threadId);

  // Functions
  const resetForm = useCallback(() => {
    if (isEditorAssistant) {
      resetFormEditorAssistant();
    }

    resetFormForKnowledgeAssistant();
  }, [isEditorAssistant, resetFormEditorAssistant, resetFormForKnowledgeAssistant]);

  const createThread = useCallback(async(initialUserMessage: string) => {
    if (isEditorAssistant) {
      const thread = await createThreadForEditorAssistant();
      return thread;
    }

    if (aiAssistantData == null) {
      return;
    }
    const thread = await createThreadForKnowledgeAssistant(aiAssistantData._id, initialUserMessage);
    return thread;
  }, [aiAssistantData, createThreadForEditorAssistant, createThreadForKnowledgeAssistant, isEditorAssistant]);

  const postMessage = useCallback(async(currentThreadId: string, formData: FormData) => {
    if (isEditorAssistant) {
      if (isEditorAssistantFormData(formData)) {
        const response = await postMessageForEditorAssistant(currentThreadId, formData);
        return response;
      }
      return;
    }
    if (aiAssistantData?._id != null) {
      const response = await postMessageForKnowledgeAssistant(aiAssistantData._id, currentThreadId, formData);
      return response;
    }
  }, [aiAssistantData?._id, isEditorAssistant, postMessageForEditorAssistant, postMessageForKnowledgeAssistant]);

  const isGenerating = generatingAnswerMessage != null;
  const submitSubstance = useCallback(async(data: FormData) => {
    // do nothing when the assistant is generating an answer
    if (isGenerating) {
      return;
    }

    // do nothing when the input is empty
    if (data.input.trim().length === 0) {
      return;
    }

    const { length: logLength } = messageLogs;

    // add user message to the logs
    const newUserMessage = { id: logLength.toString(), content: data.input, isUserMessage: true };
    setMessageLogs(msgs => [...msgs, newUserMessage]);

    resetForm();

    setErrorMessage(undefined);

    // add an empty assistant message
    const newAnswerMessage = { id: (logLength + 1).toString(), content: '' };
    setGeneratingAnswerMessage(newAnswerMessage);

    // create thread
    let currentThreadId_ = currentThreadId;
    if (currentThreadId_ == null) {
      try {
        const thread = await createThread(newUserMessage.content);
        if (thread == null) {
          return;
        }

        setCurrentThreadId(thread.threadId);
        currentThreadId_ = thread.threadId;
      }
      catch (err) {
        logger.error(err.toString());
        toastError(t('sidebar_ai_assistant.failed_to_create_or_retrieve_thread'));
      }
    }

    // post message
    try {
      if (currentThreadId_ == null) {
        return;
      }

      const response = await postMessage(currentThreadId_, data);
      if (response == null) {
        return;
      }

      if (!response.ok) {
        const resJson = await response.json();
        if ('errors' in resJson) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const errors = resJson.errors.map(({ message }) => message).join(', ');
          form.setError('input', { type: 'manual', message: `[${response.status}] ${errors}` });

          const hasThreadIdNotSetError = resJson.errors.some(err => err.code === MessageErrorCode.THREAD_ID_IS_NOT_SET);
          if (hasThreadIdNotSetError) {
            toastError(t('sidebar_ai_assistant.failed_to_create_or_retrieve_thread'));
          }
        }
        setGeneratingAnswerMessage(undefined);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      const read = async() => {
        if (reader == null) return;

        const { done, value } = await reader.read();

        // add assistant message to the logs
        if (done) {
          setGeneratingAnswerMessage((generatingAnswerMessage) => {
            if (generatingAnswerMessage == null) return;
            setMessageLogs(msgs => [...msgs, generatingAnswerMessage]);
            return undefined;
          });
          refreshCurrentThreadData(); // メッセージ送信成功後に呼び出し
          return;
        }

        const chunk = decoder.decode(value);

        const textValues: string[] = [];
        const lines = chunk.split('\n\n');
        lines.forEach((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data:')) {
            const data = JSON.parse(line.replace('data: ', ''));

            processMessageForKnowledgeAssistant(data, {
              onMessage: (data) => {
                textValues.push(data.content[0].text.value);
              },
            });

            processMessageForEditorAssistant(data, {
              onMessage: (data) => {
                textValues.push(data.appendedMessage);
              },
              onDetectedDiff: (data) => {
                logger.debug('sse diff', { data });
              },
              onFinalized: (data) => {
                logger.debug('sse finalized', { data });
              },
            });
          }
          else if (trimmedLine.startsWith('error:')) {
            const error = JSON.parse(line.replace('error: ', ''));
            logger.error(error.errorMessage);
            form.setError('input', { type: 'manual', message: error.message });

            if (error.code === StreamErrorCode.BUDGET_EXCEEDED) {
              setErrorMessage(growiCloudUri != null ? 'sidebar_ai_assistant.budget_exceeded_for_growi_cloud' : 'sidebar_ai_assistant.budget_exceeded');
            }
          }
        });


        // append text values to the assistant message
        setGeneratingAnswerMessage((prevMessage) => {
          if (prevMessage == null) return;
          return {
            ...prevMessage,
            content: prevMessage.content + textValues.join(''),
          };
        });

        read();
      };
      read();
    }
    catch (err) {
      logger.error(err.toString());
      form.setError('input', { type: 'manual', message: err.toString() });
    }

  // eslint-disable-next-line max-len
  }, [isGenerating, messageLogs, resetForm, currentThreadId, createThread, t, postMessage, form, processMessageForKnowledgeAssistant, processMessageForEditorAssistant, growiCloudUri]);

  const submit = useCallback((data: FormData) => {
    if (isEditorAssistant) {
      const markdownType = (() => {
        if (isEditorAssistantFormData(data) && data.markdownType != null) {
          return data.markdownType;
        }

        return isTextSelected ? 'selected' : 'none';
      })();

      return submitSubstance({ ...data, markdownType });
    }

    return submitSubstance(data);
  }, [isEditorAssistant, isTextSelected, submitSubstance]);

  const keyDownHandler = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      form.handleSubmit(submit)();
    }
  };

  // Views
  const headerIcon = useMemo(() => {
    return isEditorAssistant
      ? headerIconForEditorAssistant
      : headerIconForKnowledgeAssistant;
  }, [headerIconForEditorAssistant, headerIconForKnowledgeAssistant, isEditorAssistant]);

  // const currentThreadTitleFromSWR = useMemo(() => { // 削除
  //   if (isLoadingThreads || threads == null || currentThreadId == null) { // 削除
  //     return undefined; // 削除
  //   } // 削除
  //   const foundThread = threads.find(t => t.threadId === currentThreadId); // 削除
  //   return foundThread?.title; // 削除
  // }, [threads, currentThreadId, isLoadingThreads]); // 削除

  const headerText = useMemo(() => {
    if (aiAssistantSidebarData?.threadData?.title) { // useAiAssistantSidebar から取得した title を使用
      return aiAssistantSidebarData.threadData.title;
    }
    return isEditorAssistant
      ? headerTextForEditorAssistant
      : headerTextForKnowledgeAssistant;
  }, [isEditorAssistant, headerTextForEditorAssistant, headerTextForKnowledgeAssistant, aiAssistantSidebarData?.threadData?.title]); // 依存配列を更新

  const placeHolder = useMemo(() => {
    if (form.formState.isSubmitting) {
      return '';
    }
    return t(isEditorAssistant
      ? placeHolderForEditorAssistant
      : placeHolderForKnowledgeAssistant);
  }, [form.formState.isSubmitting, isEditorAssistant, placeHolderForEditorAssistant, placeHolderForKnowledgeAssistant, t]);

  const initialView = useMemo(() => {
    if (isEditorAssistant) {
      return generateInitialViewForEditorAssistant(submit);
    }

    return initialViewForKnowledgeAssistant;
  }, [generateInitialViewForEditorAssistant, initialViewForKnowledgeAssistant, isEditorAssistant, submit]);

  const messageCard = useCallback(
    (role: MessageCardRole, children: string, messageId?: string, messageLogs?: MessageLog[], generatingAnswerMessage?: MessageLog) => {
      if (isEditorAssistant) {
        if (messageId == null || messageLogs == null) {
          return <></>;
        }
        return generateMessageCardForEditorAssistant(role, children, messageId, messageLogs, generatingAnswerMessage);
      }

      return generateMessageCardForKnowledgeAssistant(role, children);
    }, [generateMessageCardForEditorAssistant, generateMessageCardForKnowledgeAssistant, isEditorAssistant],
  );

  return (
    <>
      <div className="d-flex flex-column vh-100">
        <div className="d-flex align-items-center p-3 border-bottom position-sticky top-0 bg-body z-1">
          {headerIcon}
          <h5 className="mb-0 fw-bold flex-grow-1 text-truncate">
            {headerText}
          </h5>
          <button
            type="button"
            className="btn btn-link p-0 border-0"
            onClick={closeAiAssistantSidebar}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4 d-flex flex-column gap-4 vh-100">

          { currentThreadId != null
            ? (
              <div className="vstack gap-4 pb-2">
                { messageLogs.map(message => (
                  <>
                    {messageCard(message.isUserMessage ? 'user' : 'assistant', message.content, message.id, messageLogs, generatingAnswerMessage)}
                  </>
                )) }
                { generatingAnswerMessage != null && (
                  <MessageCard role="assistant">{generatingAnswerMessage.content}</MessageCard>
                )}
                { messageLogs.length > 0 && (
                  <div className="d-flex justify-content-center">
                    <span className="bg-body-tertiary text-body-secondary rounded-pill px-3 py-1" style={{ fontSize: 'smaller' }}>
                      {t('sidebar_ai_assistant.caution_against_hallucination')}
                    </span>
                  </div>
                )}
              </div>
            )
            : (
              <>{ initialView }</>
            )
          }

          <div className="mt-auto">
            <form onSubmit={form.handleSubmit(submit)} className="flex-fill vstack gap-2">
              <Controller
                name="input"
                control={form.control}
                render={({ field }) => (
                  <ResizableTextarea
                    {...field}
                    required
                    className="form-control textarea-ask"
                    style={{ resize: 'none' }}
                    rows={1}
                    placeholder={placeHolder}
                    onKeyDown={keyDownHandler}
                    disabled={form.formState.isSubmitting}
                  />
                )}
              />
              <div className="flex-fill hstack gap-2 justify-content-between m-0">
                {!isEditorAssistant && generateModeSwitchesDropdownForKnowledgeAssistant(isGenerating)}
                <button
                  type="submit"
                  className="btn btn-submit no-border"
                  disabled={form.formState.isSubmitting || isGenerating}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </form>

            {form.formState.errors.input != null && (
              <div className="mt-4 bg-danger bg-opacity-10 rounded-3 p-2 w-100">
                <div>
                  <span className="material-symbols-outlined text-danger me-2">error</span>
                  <span className="text-danger">{ errorMessage != null ? t(errorMessage) : t('sidebar_ai_assistant.error_message') }</span>
                </div>

                <button
                  type="button"
                  className="btn btn-link text-body-secondary p-0"
                  aria-expanded={isErrorDetailCollapsed}
                  onClick={() => setIsErrorDetailCollapsed(!isErrorDetailCollapsed)}
                >
                  <span className={`material-symbols-outlined mt-2 me-1 ${isErrorDetailCollapsed ? 'rotate-90' : ''}`}>
                    chevron_right
                  </span>
                  <span className="small">{t('sidebar_ai_assistant.show_error_detail')}</span>
                </button>

                <Collapse isOpen={isErrorDetailCollapsed}>
                  <div className="ms-2">
                    <div className="">
                      <div className="text-body-secondary small">
                        {form.formState.errors.input?.message}
                      </div>
                    </div>
                  </div>
                </Collapse>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};


export const AiAssistantSidebar: FC = memo((): JSX.Element => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarScrollerRef = useRef<HTMLDivElement>(null);

  const { data: aiAssistantSidebarData, close: closeAiAssistantSidebar } = useAiAssistantSidebar();
  const { mutate: mutateIsEnableUnifiedMergeView } = useIsEnableUnifiedMergeView();

  const aiAssistantData = aiAssistantSidebarData?.aiAssistantData;
  const threadData = aiAssistantSidebarData?.threadData;
  const isOpened = aiAssistantSidebarData?.isOpened;
  const isEditorAssistant = aiAssistantSidebarData?.isEditorAssistant ?? false;

  useAiAssistantSidebarCloseEffectForEditorAssistant();
  useAiAssistantSidebarCloseEffectForKnowledgeAssistant(sidebarRef);

  useEffect(() => {
    if (!aiAssistantSidebarData?.isOpened) {
      mutateIsEnableUnifiedMergeView(false);
    }
  }, [aiAssistantSidebarData?.isOpened, mutateIsEnableUnifiedMergeView]);

  if (!isOpened) {
    return <></>;
  }

  return (
    <div
      ref={sidebarRef}
      className={`position-fixed top-0 end-0 h-100 border-start bg-body shadow-sm overflow-hidden ${moduleClass}`}
      data-testid="grw-right-sidebar"
    >
      <SimpleBar
        scrollableNodeProps={{ ref: sidebarScrollerRef }}
        className="h-100 position-relative"
        autoHide
      >
        <AiAssistantSidebarSubstance
          isEditorAssistant={isEditorAssistant}
          threadData={threadData}
          aiAssistantData={aiAssistantData}
          closeAiAssistantSidebar={closeAiAssistantSidebar}
        />
      </SimpleBar>
    </div>
  );
});
