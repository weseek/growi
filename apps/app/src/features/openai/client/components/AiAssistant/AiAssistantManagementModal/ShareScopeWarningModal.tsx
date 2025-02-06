import React, { useCallback } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

type Props = {
  isOpen: boolean,
  closeModal: () => void,
  onSubmit: () => Promise<void>,
}

export const ShareScopeWarningModal = (props: Props): JSX.Element => {
  const {
    isOpen,
    closeModal,
    onSubmit,
  } = props;

  const createAiAssistantHandler = useCallback(() => {
    closeModal();
    onSubmit();
  }, [closeModal, onSubmit]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>
        <div className="d-flex align-items-center">
          <span className="material-symbols-outlined text-warning me-2 fs-4">warning</span>
          <span className="text-warning fw-bold">共有範囲の確認</span>
        </div>
      </ModalHeader>

      <ModalBody className="py-4 px-4">
        <p className="mb-4">
          このアシスタントには限定公開されているページが含まれています。<br />
          現在の設定では、アシスタントを通じてこれらのページの情報が、本来のアクセス権限を超えて共有される可能性があります。
        </p>

        <div className="mb-4">
          <p className="mb-2 text-secondary">含まれる限定公開ページ</p>
          <code>
            /Project/GROWI/新機能/GROWI AI
          </code>
        </div>

        <p>
          続行する場合、これらのページの内容がアシスタントの公開範囲内で共有される可能性があることを確認してください。
        </p>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={closeModal}
        >
          設定を見直す
        </button>

        <button
          type="button"
          className="btn btn-warning"
          onClick={createAiAssistantHandler}
        >
          理解して続行する
        </button>
      </ModalFooter>
    </Modal>
  );
};
