import React, { type JSX } from 'react';

import { useTranslation } from 'react-i18next';

import { useAiAssistantManagementModal, useSWRxAiAssistants } from '../../../stores/ai-assistant';
import { useSWRINFxRecentThreads } from '../../../stores/thread';

import { AiAssistantTree } from './AiAssistantTree';
import { ThreadList } from './ThreadList';

import styles from './AiAssistantSubstance.module.scss';

const moduleClass = styles['grw-ai-assistant-substance'] ?? '';

export const AiAssistantContent = (): JSX.Element => {
  const { t } = useTranslation();
  const { open } = useAiAssistantManagementModal();
  const { data: aiAssistants, mutate: mutateAiAssistants } = useSWRxAiAssistants();
  const { data: recentThreads } = useSWRINFxRecentThreads();

  console.log('recentThreads', recentThreads);

  return (
    <div className={moduleClass}>
      <button
        type="button"
        className="btn btn-outline-secondary px-3 d-flex align-items-center mb-4"
        onClick={() => open()}
      >
        <span className="material-symbols-outlined fs-5 me-2">add</span>
        <span className="fw-normal">{t('ai_assistant_tree.add_assistant')}</span>
      </button>

      <div className="d-flex flex-column gap-4">
        <div>
          <h3 className="fw-bold grw-ai-assistant-substance-header">
            {t('ai_assistant_tree.my_assistants')}
          </h3>
          {aiAssistants?.myAiAssistants != null && aiAssistants.myAiAssistants.length !== 0 && (
            <AiAssistantTree
              onUpdated={mutateAiAssistants}
              onDeleted={mutateAiAssistants}
              aiAssistants={aiAssistants.myAiAssistants}
            />
          )}
        </div>

        <div>
          <h3 className="fw-bold grw-ai-assistant-substance-header">
            {t('ai_assistant_tree.team_assistants')}
          </h3>
          {aiAssistants?.teamAiAssistants != null && aiAssistants.teamAiAssistants.length !== 0 && (
            <AiAssistantTree
              onUpdated={mutateAiAssistants}
              aiAssistants={aiAssistants.teamAiAssistants}
            />
          )}
        </div>

        <div>
          <h3 className="fw-bold grw-ai-assistant-substance-header">
            最近の項目
          </h3>
          <ThreadList />
        </div>
      </div>
    </div>
  );
};
