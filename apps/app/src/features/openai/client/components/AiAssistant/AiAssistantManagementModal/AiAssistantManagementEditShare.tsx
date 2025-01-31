import React, { useCallback, useState } from 'react';

import {
  ModalBody, Input, Label, Form, FormGroup,
} from 'reactstrap';

import type { AiAssistantShareScope } from '~/features/openai/interfaces/ai-assistant';
import { AiAssistantAccessScope } from '~/features/openai/interfaces/ai-assistant';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';

import { AccessScopeDropdown } from './AccessScopeDropdown';
import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { ShareScopeSwitch } from './ShareScopeSwitch';
import { UserGroupSelector } from './UserGroupSelector';


type Props = {
  selectedUserGroups: PopulatedGrantedGroup[],
  selectedShareScope: AiAssistantShareScope,
  selectedAccessScope: AiAssistantAccessScope,
  onSelectUserGroup: (userGroup: PopulatedGrantedGroup) => void,
  onSelectAccessScope: (accessScope: AiAssistantAccessScope) => void,
}

export const AiAssistantManagementEditShare = (props: Props): JSX.Element => {
  const {
    selectedAccessScope, selectedUserGroups, onSelectAccessScope, onSelectUserGroup,
  } = props;

  const [isShared, setIsShared] = useState(false);
  const [isUserGroupSelectorOpen, setIsUserGroupSelectorOpen] = useState(false);

  const selectAccessScopeHandler = useCallback((accessScope: AiAssistantAccessScope) => {
    onSelectAccessScope(accessScope);
    if (accessScope === AiAssistantAccessScope.GROUPS) {
      setIsUserGroupSelectorOpen(true);
    }
  }, [onSelectAccessScope]);

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <Form>
          {/* トグルスイッチ */}
          <div className="form-check form-switch mb-4">
            <Input
              type="switch"
              role="switch"
              id="shareAssistantSwitch"
              className="form-check-input"
              checked={isShared}
              onChange={() => setIsShared(!isShared)}
            />
            <Label className="form-check-label" for="shareAssistantSwitch">
              アシスタントを共有する
            </Label>
          </div>

          {/* アクセス権限ドロップダウン */}
          <div className="mb-4">
            <Label className="text-secondary mb-2">ページのアクセス権限</Label>
            <AccessScopeDropdown
              isDisabled={!isShared}
              selectedAccessScope={selectedAccessScope}
              onSelect={selectAccessScopeHandler}
            />
          </div>

          {/* 共有範囲ラジオグループ */}
          <ShareScopeSwitch isDisabled={!isShared} />
        </Form>

        <UserGroupSelector
          isOpen={isUserGroupSelectorOpen}
          closeModal={() => setIsUserGroupSelectorOpen(false)}
          selectedUserGroup={selectedUserGroups}
          onSelect={onSelectUserGroup}
        />
      </ModalBody>
    </>
  );
};
