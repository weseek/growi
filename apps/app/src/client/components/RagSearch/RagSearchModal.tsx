import React, { useState } from 'react';

import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useRagSearchModal } from '~/stores/rag-search';

const RagSearchModal = (): JSX.Element => {
  const [userMessage, setUserMessage] = useState('');
  const [assistantMessage, setAssistantMessage] = useState<Array<string>>([]);

  const { data: ragSearchModalData, close: closeRagSearchModal } = useRagSearchModal();

  const onClickSubmitUserMessageHandler = async() => {
    try {
      const res = await apiv3Post('/openai/chat', { userMessage });
      const assistantMessageData = res.data.messages;

      const messages: string[] = [];
      for (const message of assistantMessageData.data.reverse()) {
        messages.push(`${message.role} > ${message.content[0].text.value}`);
      }

      setAssistantMessage(messages);
      setUserMessage('');

    }
    catch (err) {
      //
    }
  };

  return (
    <Modal size="lg" isOpen={ragSearchModalData?.isOpened ?? false} toggle={closeRagSearchModal} data-testid="search-modal">
      <ModalBody>
        <ModalHeader tag="h4" className="mb-3 p-0">
          <span className="material-symbols-outlined me-2 text-primary">psychology</span>
          GROWI Assistant
        </ModalHeader>

        <p>
          { assistantMessage }
        </p>

        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="お手伝いできることはありますか？"
            aria-label="Recipient's username"
            aria-describedby="button-addon2"
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
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
