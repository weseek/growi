import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';
import { ModalHeader } from 'reactstrap';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';


export const AiAssistantManagementHeader = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, close, changePageMode } = useAiAssistantManagementModal();

  return (
    <ModalHeader
      close={(
        <button type="button" className="btn p-0" onClick={close}>
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    >
      <div className="d-flex align-items-center">
        <button type="button" className="btn p-0 me-3" onClick={() => changePageMode(AiAssistantManagementModalPageMode.HOME)}>
          <span className="material-symbols-outlined text-primary">chevron_left</span>
        </button>
        <span>{t(`modal_ai_assistant.page_mode_title.${data?.pageMode}`)}</span>
      </div>
    </ModalHeader>
  );
};
