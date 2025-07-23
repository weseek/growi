import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import { useAiAssistantManagementModal } from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';

import styles from './AiAssistantManagementPageSelectionMethod.module.scss';

const moduleClass = styles['grw-ai-assistant-management-page-selection-method'] ?? '';

const SelectionButton = (props: { icon: string, label: string, onClick: () => void }): JSX.Element => {
  const { icon, label, onClick } = props;

  return (
    <button
      type="button"
      className="btn p-4 text-center page-selection-method-btn"
      onClick={onClick}
    >
      <span
        className="material-symbols-outlined d-block mb-3 fs-1"
      >
        {icon}
      </span>
      <div>{label}</div>
    </button>
  );
};


export const AiAssistantManagementPageSelectionMethod = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  return (
    <div className={moduleClass}>
      <AiAssistantManagementHeader
        hideBackButton={isNewAiAssistant}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center mb-4">
          {t('modal_ai_assistant.select_source_pages')}
        </h4>
        <div className="row justify-content-center">
          <div className="col-auto">
            <SelectionButton icon="manage_search" label={t('modal_ai_assistant.search_by_keyword')} onClick={() => {}} />
          </div>

          <div className="col-auto">
            <SelectionButton icon="account_tree" label={t('modal_ai_assistant.select_from_page_tree')} onClick={() => {}} />
          </div>
        </div>
      </ModalBody>
    </div>
  );
};
