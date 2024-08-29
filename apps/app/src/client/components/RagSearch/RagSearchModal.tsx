import React, { useEffect, useState } from 'react';

import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useRagSearchModal } from '~/stores/rag-search';
import loggerFactory from '~/utils/logger';

import { MessageCard } from './MessageCard';


const logger = loggerFactory('growi:clinet:components:RagSearchModal');


type Message = {
  id: string,
  content: string,
  isUserMessage?: boolean,
}

const RagSearchModal = (): JSX.Element => {

  const [input, setInput] = useState('');

  const [threadId, setThreadId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: ragSearchModalData, close: closeRagSearchModal } = useRagSearchModal();

  const isOpened = ragSearchModalData?.isOpened ?? false;

  useEffect(() => {
    // do nothing when modal is not opened
    if (!isOpened) {
      return;
    }

    // do nothing when threadId is already set
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
  }, [isOpened, threadId]);

  const onClickSubmitUserMessageHandler = async() => {
    const newUserMessage = { id: messages.length.toString(), content: input, isUserMessage: true };
    setMessages(msgs => [...msgs, newUserMessage]);

    setInput('');

    // post message
    try {
      const res = await apiv3Post('/openai/message', { userMessage: input, threadId });

      if (res.data) {
        console.log(res.data);
      }
      // if (res.data) {
      //   const newMessages: Message[] = assistantMessageData.data.reverse()
      //     .map((message: any) => {
      //       return {
      //         id: message.id,
      //         content: message.content[0].text.value,
      //       };
      //     });

      //   setMessages(msgs => [...msgs, ...newMessages]);
      //   setThreadId(assistantMessageData.data[0].threadId);
      // }
    }
    catch (err) {
      logger.error(err.toString());
    }
  };

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeRagSearchModal} data-testid="search-modal">
      <ModalBody>
        <ModalHeader tag="h4" className="mb-3 p-0">
          <span className="material-symbols-outlined me-2 text-primary">psychology</span>
          GROWI Assistant
        </ModalHeader>

        <div className="vstack gap-4">
          { messages.map(message => (
            <MessageCard key={message.id} right={message.isUserMessage}>{message.content}</MessageCard>
          )) }
        </div>

        <div className="input-group mt-5">
          <input
            type="text"
            className="form-control"
            placeholder="お手伝いできることはありますか？"
            aria-label="Recipient's username"
            aria-describedby="button-addon2"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="button"
            id="button-addon2"
            className="btn btn-outline-secondary"
            onClick={onClickSubmitUserMessageHandler}
          >
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default RagSearchModal;
