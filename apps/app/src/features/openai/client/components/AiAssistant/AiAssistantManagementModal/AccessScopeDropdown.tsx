import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Label,
} from 'reactstrap';

import { useCurrentUser } from '~/stores-universal/context';

import { AiAssistantScopeType, AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';

type Props = {
  isDisabled: boolean,
  isDisabledGroups: boolean,
  selectedAccessScope: AiAssistantAccessScope,
  onSelect: (accessScope: AiAssistantAccessScope, scopeType: AiAssistantScopeType) => void,
}

export const AccessScopeDropdown: React.FC<Props> = (props: Props) => {
  const {
    isDisabled,
    isDisabledGroups,
    selectedAccessScope,
    onSelect,
  } = props;

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const getAccessScopeLabel = useCallback((accessScope: AiAssistantAccessScope) => {
    const baseLabel = `modal_ai_assistant.access_scope.${accessScope}`;
    return accessScope === AiAssistantAccessScope.OWNER
      ? t(baseLabel, { username: currentUser?.username })
      : t(baseLabel);
  }, [currentUser?.username, t]);

  const selectAccessScopeHandler = useCallback((accessScope: AiAssistantAccessScope) => {
    onSelect(accessScope, AiAssistantScopeType.ACCESS);
  }, [onSelect]);

  return (
    <div className="mb-4">
      <Label className="text-secondary mb-2">ページのアクセス権限</Label>
      <UncontrolledDropdown>
        <DropdownToggle
          disabled={isDisabled}
          caret
          className="btn-outline-secondary bg-transparent"
        >
          {getAccessScopeLabel(selectedAccessScope)}
        </DropdownToggle>
        <DropdownMenu>
          { [AiAssistantAccessScope.OWNER, AiAssistantAccessScope.GROUPS, AiAssistantAccessScope.PUBLIC_ONLY].map(accessScope => (
            <DropdownItem
              disabled={isDisabledGroups && accessScope === AiAssistantAccessScope.GROUPS}
              onClick={() => selectAccessScopeHandler(accessScope)}
              key={accessScope}
            >
              {getAccessScopeLabel(accessScope)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
};
