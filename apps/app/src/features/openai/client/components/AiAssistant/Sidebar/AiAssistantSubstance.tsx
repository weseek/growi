import React, { type JSX } from 'react';

import { useTranslation } from 'react-i18next';

import { useAiAssistantManagementModal, useSWRxAiAssistants } from '../../../stores/ai-assistant';

import { AiAssistantCollapse } from './AiAssistantCollapse';

import styles from './AiAssistantSubstance.module.scss';

const moduleClass = styles['grw-ai-assistant-substance'] ?? '';

export const AiAssistantContent = (): JSX.Element => {
  const { t } = useTranslation();
  const { open } = useAiAssistantManagementModal();
  const { data: aiAssistants, mutate: mutateAiAssistants } = useSWRxAiAssistants();

  return (
    <div className={moduleClass}>
      <button
        type="button"
        className="btn btn-outline-secondary px-3 d-flex align-items-center mb-4"
        onClick={() => open()}
      >
        <span className="material-symbols-outlined fs-5 me-2">add</span>
        <span className="fw-normal">{t('ai_assistant_collapse .add_assistant')}</span>
      </button>

      <div className="d-flex flex-column gap-4">
        <div>
          <AiAssistantCollapse
            onUpdated={mutateAiAssistants}
            onDeleted={mutateAiAssistants}
            aiAssistants={aiAssistants?.myAiAssistants ?? []}
          />
        </div>

        <div>
          <AiAssistantCollapse
            isTeamAssistant
            onUpdated={mutateAiAssistants}
            aiAssistants={aiAssistants?.teamAiAssistants ?? []}
          />
        </div>
      </div>
    </div>
  );
};
