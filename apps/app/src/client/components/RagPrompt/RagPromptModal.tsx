
import React, { useState } from 'react';

import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { useRagPromptModal } from '~/stores/rag-prompt';

const RagPromptModal = (): JSX.Element => {
  const [userMessage, setUserMessage] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');

  const { data: ragPromptModalData, close: closeRagPromptModal } = useRagPromptModal();

  const onClickSubmitUserMessageHandler = async() => {
    try {
      const res = await apiv3Post('/openai/chat', { userMessage });
      setAssistantMessage(res.data.assistantMessage);
    }
    catch (err) {
      //
    }
  };

  return (
    <Modal size="lg" isOpen={ragPromptModalData?.isOpened ?? false} toggle={closeRagPromptModal} data-testid="search-modal">
      <ModalBody>
        <ModalHeader tag="h4" className="mb-3 p-0">
          Chat
        </ModalHeader>

        <p>
          { assistantMessage }
        </p>

        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="検索結果を生成するためのメッセージを入力してください"
            aria-label="Recipient's username"
            aria-describedby="button-addon2"
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

export default RagPromptModal;
