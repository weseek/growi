import { type JSX } from 'react';

import { useTranslation } from 'react-i18next';
import { ModalHeader } from 'reactstrap';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

type Props = {
  labelTranslationKey: string;
  backToPageMode?: AiAssistantManagementModalPageMode;
  hideBackButton?: boolean;
  backButtonColor?: 'primary' | 'secondary';
}

export const AiAssistantManagementHeader = (props: Props): JSX.Element => {
  const {
    labelTranslationKey, backToPageMode, hideBackButton, backButtonColor = 'primary',
  } = props;

  const { t } = useTranslation();
  const { close, changePageMode } = useAiAssistantManagementModal();

  return (
    <ModalHeader
      tag="h4"
      close={(
        <button type="button" className="btn p-0" onClick={close}>
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    >
      <div className="d-flex align-items-center">
        { hideBackButton
          ? (
            <span className="growi-custom-icons growi-ai-assistant-icon me-3 fs-4">growi_ai</span>
          )
          : (
            <button type="button" className="btn p-0 me-3" onClick={() => changePageMode(backToPageMode ?? AiAssistantManagementModalPageMode.HOME)}>
              <span className={`material-symbols-outlined text-${backButtonColor}`}>chevron_left</span>
            </button>
          )
        }
        <span className="fw-bold">{t(labelTranslationKey)}</span>
      </div>
    </ModalHeader>
  );
};
