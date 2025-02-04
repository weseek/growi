import React, { useCallback, useState } from 'react';

import {
  ModalBody, Input, Label,
} from 'reactstrap';

import { AiAssistantScopeType, AiAssistantShareScope, AiAssistantAccessScope } from '~/features/openai/interfaces/ai-assistant';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import { useSWRxUserRelatedGroups } from '~/stores/user';

import { AccessScopeDropdown } from './AccessScopeDropdown';
import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectUserGroupModal } from './SelectUserGroupModal';
import { ShareScopeSwitch } from './ShareScopeSwitch';


type Props = {
  selectedShareScope: AiAssistantShareScope,
  selectedAccessScope: AiAssistantAccessScope,
  selectedUserGroupsForShareScope: PopulatedGrantedGroup[],
  selectedUserGroupsForAccessScope: PopulatedGrantedGroup[],
  onSelectUserGroup: (userGroup: PopulatedGrantedGroup, scopeType: AiAssistantScopeType) => void,
  onSelectShareScope: (scope: AiAssistantShareScope) => void,
  onSelectAccessScope: (scope: AiAssistantAccessScope) => void,
}

export const AiAssistantManagementEditShare = (props: Props): JSX.Element => {
  const {
    selectedShareScope,
    selectedAccessScope,
    selectedUserGroupsForShareScope,
    selectedUserGroupsForAccessScope,
    onSelectUserGroup,
    onSelectShareScope,
    onSelectAccessScope,
  } = props;

  const { data: userRelatedGroups } = useSWRxUserRelatedGroups();
  const hasNoRelatedGroups = userRelatedGroups == null || userRelatedGroups.relatedGroups.length === 0;

  const [isShared, setIsShared] = useState(false);
  const [isSelectUserGroupModalOpen, setIsSelectUserGroupModalOpen] = useState(false);
  const [selectedUserGroupType, setSelectedUserGroupType] = useState<AiAssistantScopeType>(AiAssistantScopeType.ACCESS);

  const changeShareToggleHandler = useCallback(() => {
    setIsShared((prev) => {
      if (prev) { // if isShared === true
        onSelectShareScope(AiAssistantShareScope.SAME_AS_ACCESS_SCOPE);
        onSelectAccessScope(AiAssistantAccessScope.OWNER);
      }
      else {
        onSelectShareScope(AiAssistantShareScope.PUBLIC_ONLY);
      }
      return !prev;
    });
  }, [onSelectAccessScope, onSelectShareScope]);

  const selectGroupScopeHandler = useCallback((scopeType: AiAssistantScopeType) => {
    setSelectedUserGroupType(scopeType);
    setIsSelectUserGroupModalOpen(true);
  }, []);

  const selectShareScopeHandler = useCallback((shareScope: AiAssistantShareScope) => {
    onSelectShareScope(shareScope);
    if (shareScope === AiAssistantShareScope.GROUPS && !hasNoRelatedGroups) {
      selectGroupScopeHandler(AiAssistantScopeType.SHARE);
    }
  }, [hasNoRelatedGroups, onSelectShareScope, selectGroupScopeHandler]);

  const selectAccessScopeHandler = useCallback((accessScope: AiAssistantAccessScope) => {
    onSelectAccessScope(accessScope);
    if (accessScope === AiAssistantAccessScope.GROUPS && !hasNoRelatedGroups) {
      selectGroupScopeHandler(AiAssistantScopeType.ACCESS);
    }
  }, [hasNoRelatedGroups, onSelectAccessScope, selectGroupScopeHandler]);


  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <div className="form-check form-switch mb-4">
          <Input
            type="switch"
            role="switch"
            id="shareAssistantSwitch"
            className="form-check-input"
            checked={isShared}
            onChange={changeShareToggleHandler}
          />
          <Label className="form-check-label" for="shareAssistantSwitch">
            アシスタントを共有する
          </Label>
        </div>

        <AccessScopeDropdown
          isDisabled={!isShared}
          isDisabledGroups={hasNoRelatedGroups}
          selectedAccessScope={selectedAccessScope}
          onSelect={selectAccessScopeHandler}
        />

        <ShareScopeSwitch
          isDisabled={!isShared}
          isDisabledGroups={hasNoRelatedGroups}
          selectedShareScope={selectedShareScope}
          onSelect={selectShareScopeHandler}
        />

        <SelectUserGroupModal
          isOpen={isSelectUserGroupModalOpen}
          userRelatedGroups={userRelatedGroups?.relatedGroups}
          closeModal={() => setIsSelectUserGroupModalOpen(false)}
          selectedUserGroupType={selectedUserGroupType}
          selectedUserGroup={selectedUserGroupType === AiAssistantScopeType.ACCESS ? selectedUserGroupsForAccessScope : selectedUserGroupsForShareScope}
          onSelect={onSelectUserGroup}
        />
      </ModalBody>
    </>
  );
};
