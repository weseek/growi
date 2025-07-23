import React, { useState } from 'react';

import {
  ModalBody,
} from 'reactstrap';

import { useTranslation } from 'react-i18next';
import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { useAiAssistantManagementModal  } from '../../../stores/ai-assistant';


const SelectionButton = (props: { icon: string, label: string, onClick: () => void }): JSX.Element => {
  const { icon, label, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className={`btn p-4 text-center ${isHovered ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
      style={{ width: '280px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span
        className="material-symbols-outlined d-block mb-3"
        style={{ fontSize: '48px' }}
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
  const isNewAiAssistant  = aiAssistantManagementModalData?.aiAssistantData == null;

  return (
    <>
      <AiAssistantManagementHeader
        hideBackButton={isNewAiAssistant}
        label={t(isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant')}
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
    </>
  );
};
