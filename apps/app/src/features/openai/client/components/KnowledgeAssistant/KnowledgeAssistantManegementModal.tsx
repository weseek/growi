import React from 'react';

import { useTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { useKnowledgeAssistantModal } from '../../stores/knowledge-assistant';

import styles from './KnowledgeAssistantManegementModal.module.scss';

const moduleClass = styles['grw-knowledge-assistant-manegement'] ?? '';


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
    <Modal size="lg" isOpen={isOpened} toggle={closeKnowledgeAssistantModal} className={moduleClass} scrollable>

      <ModalHeader tag="h4" toggle={closeKnowledgeAssistantModal} className="pe-4">
        <span className="growi-custom-icons growi-knowledge-assistant-icon me-3 fs-4">knowledge_assistant</span>
        <span className="fw-bold">新規アシスタントの追加</span> {/* TODO i18n */}
      </ModalHeader>

      { isOpened && (
        <KnowledgeAssistantManegementModalSubstance />
      ) }

    </Modal>
  );
};
