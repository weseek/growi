import React, { useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import { useCurrentUser } from '~/stores-universal/context';

import { AiAssistantAccessScope, AiAssistantShareScope } from '../../../interfaces/ai-assistant';

import { UserGroupSelector } from './UserGroupSelector';

type Props = {
  selectedAccessScope: AiAssistantAccessScope,
  selectedUserGroup: PopulatedGrantedGroup[];
  onSelectAccessScope: (accessScope: AiAssistantAccessScope) => void,
  onSelectUserGroup: (userGroup: PopulatedGrantedGroup) => void,
}

export const AccessScopeDropdown: React.FC<Props> = (props: Props) => {
  const {
    selectedAccessScope, selectedUserGroup, onSelectAccessScope, onSelectUserGroup,
  } = props;

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const [isUserGroupSelectorOpen, setIsUserGroupSelectorOpen] = useState(false);

  const getAccessScopeLabel = useCallback((accessScope: AiAssistantAccessScope) => {
    const baseLabel = `modal_ai_assistant.access_scope.${accessScope}`;
    return accessScope === AiAssistantAccessScope.OWNER
      ? t(baseLabel, { username: currentUser?.username })
      : t(baseLabel);
  }, [currentUser?.username, t]);

  const selectAccessScopeHandler = useCallback((accessScope: AiAssistantAccessScope) => {
    onSelectAccessScope(accessScope);
    if (accessScope === AiAssistantAccessScope.GROUPS) {
      setIsUserGroupSelectorOpen(true);
    }
  }, [onSelectAccessScope]);

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
        selectedUserGroup={selectedUserGroup}
        onSelect={onSelectUserGroup}
      />
    </>
  );
};
