import React from 'react';

import { useTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { useKnowledgeAssistantModal } from '../../stores/knowledge-assistant';

const KnowledgeAssistantManegementModalSubstance = (): JSX.Element => {
  return (
    <>
      <ModalBody>
        TODO: https://redmine.weseek.co.jp/issues/159180
      </ModalBody>
    </>
  );
};


export const KnowledgeAssistantManegementModal = (): JSX.Element => {

  const { t } = useTranslation();

  const { data: knowledgeAssistantModalData, close: closeKnowledgeAssistantModal } = useKnowledgeAssistantModal();

  const isOpened = knowledgeAssistantModalData?.isOpened ?? false;

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeKnowledgeAssistantModal} scrollable>

      <ModalHeader tag="h4" toggle={closeKnowledgeAssistantModal} className="pe-4">
        <span className="growi-custom-icons growi-ai-chat-icon me-3 fs-4">knowledge_assistant</span>
        <span className="fw-bold">新規アシスタントの追加</span>
        <span className="fs-5 text-body-secondary ms-3">{t('modal_aichat.title_beta_label')}</span>
      </ModalHeader>

      { isOpened && (
        <KnowledgeAssistantManegementModalSubstance />
      ) }

    </Modal>
  );
};
