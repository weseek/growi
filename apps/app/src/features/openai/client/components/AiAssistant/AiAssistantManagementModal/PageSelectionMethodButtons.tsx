import React from 'react';

import { useTranslation } from 'react-i18next';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

import styles from './PageSelectionMethodButtons.module.scss';

const moduleClass = styles['page-selection-method-buttons'] ?? '';

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


export const PageSelectionMethodButtons = (): JSX.Element => {
  const { t } = useTranslation();
  const { changePageMode } = useAiAssistantManagementModal();

  return (
    <div className={moduleClass}>
      <div className="row justify-content-center">
        <div className="col-auto">
          <SelectionButton
            icon="manage_search"
            label={t('modal_ai_assistant.search_by_keyword')}
            onClick={() => changePageMode(AiAssistantManagementModalPageMode.KEYWORD_SEARCH)}
          />
        </div>
        <div className="col-auto">
          <SelectionButton
            icon="account_tree"
            label={t('modal_ai_assistant.select_from_page_tree')}
            onClick={() => changePageMode(AiAssistantManagementModalPageMode.PAGE_TREE_SELECTION)}
          />
        </div>
      </div>
    </div>
  );
};
