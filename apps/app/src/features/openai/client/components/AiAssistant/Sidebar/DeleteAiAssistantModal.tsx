import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import type { AiAssistantHasId } from '../../../../interfaces/ai-assistant';

export type DeleteAiAssistantModalProps = {
  isShown: boolean;
  aiAssistant: AiAssistantHasId | null;
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteAiAssistantModal: React.FC<DeleteAiAssistantModalProps> = ({
  isShown, aiAssistant, errorMessage, onCancel, onConfirm,
}) => {
  const { t } = useTranslation();

  const headerContent = () => {
    if (!isShown || aiAssistant == null) {
      return null;
    }
    return (
      <>
        <span className="material-symbols-outlined me-1">delete_forever</span>
        {t('ai_assistant_tree.delete_modal.title')}
      </>
    );
  };

  const bodyContent = () => {
    if (!isShown || aiAssistant == null) {
      return null;
    }
    return <p>{t('ai_assistant_tree.delete_modal.confirm_message')}</p>;
  };

  const footerContent = () => {
    if (!isShown || aiAssistant == null) {
      return null;
    }
    return (
      <>
        {errorMessage && <span className="text-danger">{errorMessage}</span>}
        <Button color="secondary" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button color="danger" onClick={onConfirm}>
          {t('Delete')}
        </Button>
      </>
    );
  };

  return (
    <Modal isOpen={isShown} toggle={onCancel}>
      <ModalHeader tag="h4" toggle={onCancel} className="text-danger">
        {headerContent()}
      </ModalHeader>
      <ModalBody>
        {bodyContent()}
      </ModalBody>
      <ModalFooter>
        {footerContent()}
      </ModalFooter>
    </Modal>
  );
};
