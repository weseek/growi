
import React, { useState, useMemo, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import type { AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import { useSWRxAiAssistants } from '../../../stores/ai-assistant';
import { getShareScopeIcon } from '../../../utils/get-share-scope-Icon';


type Props = {
  //
}

export const AiAssistantDropdown = (props: Props): JSX.Element => {
  const [selectedAiAssistant, setSelectedAiAssistant] = useState<AiAssistantHasId>();

  const { t } = useTranslation();
  const { data: aiAssistantData } = useSWRxAiAssistants();

  const allAiAssistants = useMemo(() => {
    if (aiAssistantData == null) {
      return [];
    }
    return [...aiAssistantData.myAiAssistants, ...aiAssistantData.teamAiAssistants];
  }, [aiAssistantData]);

  const getAiAssistantLabel = useCallback((aiAssistant: AiAssistantHasId) => {
    return (
      <>
        <span className="material-symbols-outlined fs-5 me-1">
          {getShareScopeIcon(aiAssistant.shareScope, aiAssistant.accessScope)}
        </span>
        {aiAssistant.name}
      </>
    );
  }, []);

  return (
    <UncontrolledDropdown>
      <DropdownToggle className="btn btn-outline-secondary" disabled={allAiAssistants.length === 0}>
        {selectedAiAssistant != null
          ? getAiAssistantLabel(selectedAiAssistant)
          : <><span className="material-symbols-outlined fs-5">Add</span>{t('sidebar_ai_assistant.use_assistant')}</>
        }
      </DropdownToggle>
      <DropdownMenu>
        {allAiAssistants.map((aiAssistant) => {
          return (
            <DropdownItem
              key={aiAssistant._id}
              active={selectedAiAssistant?._id === aiAssistant._id}
              onClick={() => setSelectedAiAssistant(aiAssistant)}
            >
              {getAiAssistantLabel(aiAssistant)}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
