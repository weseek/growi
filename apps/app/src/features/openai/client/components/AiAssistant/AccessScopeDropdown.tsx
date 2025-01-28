import React, { useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { useCurrentUser } from '~/stores-universal/context';
import { useSWRxUserRelatedGroups } from '~/stores/user';

import { AiAssistantAccessScope, AiAssistantShareScope } from '../../../interfaces/ai-assistant';

export const AccessScopeDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: userRelatedGroups } = useSWRxUserRelatedGroups();

  const [selectedAccessScope, setSelectedAccessScope] = useState<AiAssistantAccessScope>(AiAssistantAccessScope.OWNER);

  const getAccessScopeLabel = useCallback((accessScope: AiAssistantAccessScope) => {
    const baseLabel = `modal_ai_assistant.access_scope.${accessScope}`;
    return accessScope === AiAssistantAccessScope.OWNER
      ? t(baseLabel, { username: currentUser?.username })
      : t(baseLabel);
  }, [currentUser?.username, t]);

  return (
    <UncontrolledDropdown>
      <DropdownToggle
        caret
        className="btn-outline-secondary"
      >
        {getAccessScopeLabel(selectedAccessScope)}
      </DropdownToggle>
      <DropdownMenu>
        { [AiAssistantAccessScope.OWNER, AiAssistantShareScope.GROUPS, AiAssistantAccessScope.PUBLIC_ONLY].map(accessScope => (
          <DropdownItem onClick={() => setSelectedAccessScope(accessScope)}>
            {getAccessScopeLabel(accessScope)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
