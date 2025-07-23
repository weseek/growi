import { type JSX, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { ModalHeader } from 'reactstrap';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

type Props = {
  label?: string;
  backToPageMode?: AiAssistantManagementModalPageMode;
  hideBackButton?: boolean;
}

export const AiAssistantManagementHeader = (props: Props): JSX.Element => {
  const { label, backToPageMode, hideBackButton } = props;

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
        { !hideBackButton && (
          <button type="button" className="btn p-0 me-3" onClick={() => changePageMode(backToPageMode ?? AiAssistantManagementModalPageMode.HOME)}>
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
        )}
        <span>{t(`modal_ai_assistant.page_mode_title.${data?.pageMode}`)}</span>
      </div>
    </ModalHeader>
  );
};
