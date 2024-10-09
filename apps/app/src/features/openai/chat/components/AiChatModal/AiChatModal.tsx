import type { KeyboardEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Modal, ModalBody, ModalFooter, ModalHeader,
} from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useRagSearchModal } from '~/stores/rag-search';
import loggerFactory from '~/utils/logger';

import { MessageCard } from './MessageCard';
import { ResizableTextarea } from './ResizableTextArea';

import styles from './AiChatModal.module.scss';

const moduleClass = styles['grw-aichat-modal'] ?? '';

const logger = loggerFactory('growi:clinet:components:RagSearchModal');


type Message = {
  id: string,
  content: string,
  isUserMessage?: boolean,
}

type FormData = {
  input: string;
};

const AiChatModalSubstance = (): JSX.Element => {

  const { t } = useTranslation();

  const form = useForm<FormData>({
    defaultValues: {
      input: '',
    },
  });

  const [threadId, setThreadId] = useState<string | undefined>();
  const [messageLogs, setMessageLogs] = useState<Message[]>([]);
  const [generatingAnswerMessage, setGeneratingAnswerMessage] = useState<Message>();

  const isGenerating = generatingAnswerMessage != null;

  useEffect(() => {
    // do nothing when the modal is closed or threadId is already set
    if (threadId != null) {
      return;
    }

    const createThread = async() => {
      // create thread
      try {
        const res = await apiv3Post('/openai/thread', { threadId });
        const thread = res.data.thread;

        setThreadId(thread.id);
      }
      catch (err) {
        logger.error(err.toString());
      }
    };

    createThread();
  }, [threadId]);

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
    form.reset();

    // add an empty assistant message
    const newAnswerMessage = { id: (logLength + 1).toString(), content: '' };
    setGeneratingAnswerMessage(newAnswerMessage);

    // post message
    try {
      const response = await fetch('/_api/v3/openai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: data.input, threadId }),
      });

      if (!response.ok) {
        const resJson = await response.json();
        if ('errors' in resJson) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const errors = resJson.errors.map(({ message }) => message).join(', ');
          form.setError('input', { type: 'manual', message: `[${response.status}] ${errors}` });
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

        // Extract text values from the chunk
        const textValues = chunk
          .split('\n\n')
          .filter(line => line.trim().startsWith('data:'))
          .map((line) => {
            const data = JSON.parse(line.replace('data: ', ''));
            return data.content[0].text.value;
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

  }, [form, isGenerating, messageLogs, threadId]);

  const keyDownHandler = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      form.handleSubmit(submit)();
    }
  };

  return (
    <>
      <ModalBody className="pb-0 pt-3 pt-lg-4 px-3 px-lg-4">
        <div className="vstack gap-4 pb-4">
          { messageLogs.map(message => (
            <MessageCard key={message.id} role={message.isUserMessage ? 'user' : 'assistant'}>{message.content}</MessageCard>
          )) }
          { generatingAnswerMessage != null && (
            <MessageCard role="assistant">{generatingAnswerMessage.content}</MessageCard>
          )}
          { messageLogs.length > 0 && (
            <div className="d-flex justify-content-center">
              <span className="bg-body-tertiary text-body-secondary rounded-pill px-3 py-1" style={{ fontSize: 'smaller' }}>
                {t('modal_aichat.caution_against_hallucination')}
              </span>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter className="flex-column align-items-start pt-0 pb-3 pb-lg-4 px-3 px-lg-4">
        <form onSubmit={form.handleSubmit(submit)} className="flex-fill hstack gap-2 align-items-end m-0">
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
                placeholder={!form.formState.isSubmitting ? t('modal_aichat.placeholder') : ''}
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
        </form>

        {form.formState.errors.input != null && (
          <span className="text-danger small">{form.formState.errors.input?.message}</span>
        )}
      </ModalFooter>
    </>
  );
};


export const AiChatModal = (): JSX.Element => {

  const { t } = useTranslation();

  const { data: ragSearchModalData, close: closeRagSearchModal } = useRagSearchModal();

  const isOpened = ragSearchModalData?.isOpened ?? false;

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeRagSearchModal} className={moduleClass} scrollable>

      <ModalHeader tag="h4" toggle={closeRagSearchModal} className="pe-4">
        <span className="material-symbols-outlined growi-ai-chat-icon me-3">chat</span>
        <span className="fw-bold">{t('modal_aichat.title')}</span>
        <span className="fs-5 text-body-secondary ms-3">{t('modal_aichat.title_beta_label')}</span>
      </ModalHeader>

      { isOpened && (
        <AiChatModalSubstance />
      ) }

    </Modal>
  );
};
