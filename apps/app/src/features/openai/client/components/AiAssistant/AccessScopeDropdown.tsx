import React, { useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { useCurrentUser } from '~/stores-universal/context';

import { AiAssistantAccessScope, AiAssistantShareScope } from '../../../interfaces/ai-assistant';

import { UserGroupSelector } from './UserGroupSelector';

export const AccessScopeDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const [isUserGroupSelectorOpen, setIsUserGroupSelectorOpen] = useState(false);
  const [selectedAccessScope, setSelectedAccessScope] = useState<AiAssistantAccessScope>(AiAssistantAccessScope.OWNER);

  const getAccessScopeLabel = useCallback((accessScope: AiAssistantAccessScope) => {
    const baseLabel = `modal_ai_assistant.access_scope.${accessScope}`;
    return accessScope === AiAssistantAccessScope.OWNER
      ? t(baseLabel, { username: currentUser?.username })
      : t(baseLabel);
  }, [currentUser?.username, t]);

  const selectAccessScopeHandler = useCallback((accessScope: AiAssistantAccessScope) => {
    setSelectedAccessScope(accessScope);
    if (accessScope === AiAssistantAccessScope.GROUPS) {
      setIsUserGroupSelectorOpen(true);
    }
  }, []);

  return (
    <>
      <UncontrolledDropdown>
        <DropdownToggle
          caret
          className="btn-outline-secondary"
        >
          {getAccessScopeLabel(selectedAccessScope)}
        </DropdownToggle>
        <DropdownMenu>
          { [AiAssistantAccessScope.OWNER, AiAssistantShareScope.GROUPS, AiAssistantAccessScope.PUBLIC_ONLY].map(accessScope => (
            <DropdownItem onClick={() => selectAccessScopeHandler(accessScope)}>
              {getAccessScopeLabel(accessScope)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </UncontrolledDropdown>

      <UserGroupSelector
        isOpen={isUserGroupSelectorOpen}
        closeModal={() => setIsUserGroupSelectorOpen(false)}
      />
    </>
  );
};
