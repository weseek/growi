import type { KeyboardEvent, JSX } from 'react';
import {
  type FC, memo, useRef, useEffect, useState, useCallback, useMemo,
} from 'react';

import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Collapse, UncontrolledTooltip } from 'reactstrap';
import SimpleBar from 'simplebar-react';

import { toastError } from '~/client/util/toastr';
import { useGrowiCloudUri, useIsEnableUnifiedMergeView } from '~/stores-universal/context';
import { useEditorMode, EditorMode } from '~/stores-universal/ui';
import loggerFactory from '~/utils/logger';

import type { AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import { MessageErrorCode, StreamErrorCode } from '../../../../interfaces/message-error';
import type { IThreadRelationHasId } from '../../../../interfaces/thread-relation';
import { useEditorAssistant } from '../../../services/editor-assistant';
import { useKnowledgeAssistant } from '../../../services/knowledge-assistant';
import { useAiAssistantSidebar } from '../../../stores/ai-assistant';
import { useSWRMUTxMessages } from '../../../stores/message';
import { useSWRMUTxThreads } from '../../../stores/thread';

import { AiAssistantChatInitialView } from './AiAssistantChatInitialView';
import { AiAssistantDropdown } from './AiAssistantDropdown';
import { MessageCard } from './MessageCard';
import { QuickMenuList } from './QuickMenuList';
import { ResizableTextarea } from './ResizableTextArea';

import styles from './AiAssistantSidebar.module.scss';

const logger = loggerFactory('growi:openai:client:components:AiAssistantSidebar');

const moduleClass = styles['grw-ai-assistant-sidebar'] ?? '';

type Message = {
  id: string,
  content: string,
  isUserMessage?: boolean,
}

type FormData = {
  input: string;
  summaryMode?: boolean;
};

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

  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(threadData?.threadId);
  const [messageLogs, setMessageLogs] = useState<Message[]>([]);
  const [generatingAnswerMessage, setGeneratingAnswerMessage] = useState<Message>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isErrorDetailCollapsed, setIsErrorDetailCollapsed] = useState<boolean>(false);
  const [selectedAiAssistant, setSelectedAiAssistant] = useState<AiAssistantHasId>();

  const { t } = useTranslation();
  const { data: growiCloudUri } = useGrowiCloudUri();
  const { trigger: mutateThreadData } = useSWRMUTxThreads(aiAssistantData?._id);
  const { trigger: mutateMessageData } = useSWRMUTxMessages(aiAssistantData?._id, threadData?.threadId);

  const {
    createThread: createThreadForKnowledgeAssistant,
    postMessage: postMessageForKnowledgeAssistant,
    processMessage: processMessageForKnowledgeAssistant,
    headerIcon: headerIconForKnowledgeAssistant,
    headerText: headerTextForKnowledgeAssistant,
    placeHolder: placeHolderForKnowledgeAssistant,
  } = useKnowledgeAssistant();

  const {
    createThread: createThreadForEditorAssistant,
    postMessage: postMessageForEditorAssistant,
    processMessage: processMessageForEditorAssistant,
    accept,
    reject,
    headerIcon: headerIconForEditorAssistant,
    headerText: headerTextForEditorAssistant,
    placeHolder: placeHolderForEditorAssistant,
  } = useEditorAssistant();

  const form = useForm<FormData>({
    defaultValues: {
      input: '',
      summaryMode: true,
    },
  });

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

    if (threadData != null) {
      fetchAndSetMessageData();
    }
  }, [mutateMessageData, threadData]);

  const createThread = useCallback(async(initialUserMessage: string) => {
    if (isEditorAssistant) {
      const thread = await createThreadForEditorAssistant(selectedAiAssistant?._id);
      return thread;
    }

    if (aiAssistantData == null) {
      return;
    }
    const thread = await createThreadForKnowledgeAssistant(aiAssistantData._id, initialUserMessage);
    return thread;
  }, [aiAssistantData, createThreadForEditorAssistant, createThreadForKnowledgeAssistant, isEditorAssistant, selectedAiAssistant?._id]);

  const isActionButtonShown = useCallback((messageId: string) => {
    if (!isEditorAssistant) {
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
  }, [generatingAnswerMessage, isEditorAssistant, messageLogs]);

  const headerIcon = useMemo(() => {
    return isEditorAssistant
      ? headerIconForEditorAssistant
      : headerIconForKnowledgeAssistant;
  }, [headerIconForEditorAssistant, headerIconForKnowledgeAssistant, isEditorAssistant]);

  const headerText = useMemo(() => {
    return isEditorAssistant
      ? headerTextForEditorAssistant
      : headerTextForKnowledgeAssistant;
  }, [isEditorAssistant, headerTextForEditorAssistant, headerTextForKnowledgeAssistant]);

  const placeHolder = useMemo(() => {
    if (form.formState.isSubmitting) {
      return '';
    }
    return t(isEditorAssistant
      ? placeHolderForEditorAssistant
      : placeHolderForKnowledgeAssistant);
  }, [form.formState.isSubmitting, isEditorAssistant, placeHolderForEditorAssistant, placeHolderForKnowledgeAssistant, t]);

  const isGenerating = generatingAnswerMessage != null;
  const submit = useCallback(async(data: FormData) => {
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

    // reset form
    form.reset({ input: '', summaryMode: data.summaryMode });
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

        // No need to await because data is not used
        if (!isEditorAssistant) {
          mutateThreadData();
        }
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

      const response = await (async() => {
        if (isEditorAssistant) {
          return postMessageForEditorAssistant(currentThreadId_, data.input);
        }
        if (aiAssistantData?._id != null) {
          return postMessageForKnowledgeAssistant(aiAssistantData._id, currentThreadId_, data.input, data.summaryMode);
        }
      })();

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
                console.log('sse diff', { data });
              },
              onFinalized: (data) => {
                console.log('sse finalized', { data });
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
  }, [isGenerating, messageLogs, form, currentThreadId, createThread, isEditorAssistant, mutateThreadData, t, aiAssistantData?._id, postMessageForEditorAssistant, postMessageForKnowledgeAssistant, processMessageForKnowledgeAssistant, processMessageForEditorAssistant, growiCloudUri]);

  const keyDownHandler = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      form.handleSubmit(submit)();
    }
  };

  const clickQuickMenuHandler = useCallback(async(quickMenu: string) => {
    await submit({ input: quickMenu });
  }, [submit]);

  const clickAcceptHandler = useCallback(() => {
    accept();
  }, [accept]);

  const clickDiscardHandler = useCallback(() => {
    reject();
  }, [reject]);

  const selectAiAssistantHandler = useCallback((aiAssistant?: AiAssistantHasId) => {
    setSelectedAiAssistant(aiAssistant);
  }, []);

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
                  <MessageCard
                    key={message.id}
                    role={message.isUserMessage ? 'user' : 'assistant'}
                    showActionButtons={isActionButtonShown(message.id)}
                    onAccept={clickAcceptHandler}
                    onDiscard={clickDiscardHandler}
                  >
                    {message.content}
                  </MessageCard>
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
              <>{isEditorAssistant
                ? (
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
                )
                : (
                  <AiAssistantChatInitialView
                    description={aiAssistantData?.description ?? ''}
                    additionalInstruction={aiAssistantData?.additionalInstruction ?? ''}
                    pagePathPatterns={aiAssistantData?.pagePathPatterns ?? []}
                  />
                )}
              </>
            )
          }

          <div className="mt-auto">
            <form onSubmit={form.handleSubmit(submit)} className="flex-fill vstack gap-3">
              <div className="flex-fill hstack gap-2 align-items-end m-0">
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
                <button
                  type="submit"
                  className="btn btn-submit no-border"
                  disabled={form.formState.isSubmitting || isGenerating}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
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

  const { data: editorMode } = useEditorMode();
  const { data: aiAssistantSidebarData, close: closeAiAssistantSidebar } = useAiAssistantSidebar();
  const { mutate: mutateIsEnableUnifiedMergeView } = useIsEnableUnifiedMergeView();

  const aiAssistantData = aiAssistantSidebarData?.aiAssistantData;
  const threadData = aiAssistantSidebarData?.threadData;
  const isOpened = aiAssistantSidebarData?.isOpened;
  const isEditorAssistant = aiAssistantSidebarData?.isEditorAssistant ?? false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpened && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && !isEditorAssistant) {
        closeAiAssistantSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAiAssistantSidebar, isEditorAssistant, isOpened]);

  useEffect(() => {
    if (isEditorAssistant && editorMode !== EditorMode.Editor) {
      closeAiAssistantSidebar();
    }
  }, [closeAiAssistantSidebar, editorMode, isEditorAssistant]);

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
