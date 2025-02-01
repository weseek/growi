import React, { useCallback, useState } from 'react';

import {
  Input, Label, FormGroup,
} from 'reactstrap';

import type { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';
import { AiAssistantShareScope, AiAssistantScopeType } from '../../../../interfaces/ai-assistant';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { OWNER, ...excludedOwnerShareScope } = AiAssistantShareScope;
const ShareScopeSwitchType = {
  ...excludedOwnerShareScope,
  SAME_AS_ACCESS_SCOPE: 'sameAsAccessScope',
} as const;

type ShareScopeSwitchType = typeof ShareScopeSwitchType[keyof typeof ShareScopeSwitchType];

type Props = {
  isDisabled: boolean,
  selectedShareScope: AiAssistantShareScope,
  selectedAccessScope: AiAssistantAccessScope,
  onSelect: (shareScope: AiAssistantShareScope, scopeType: AiAssistantScopeType) => void,
}

export const ShareScopeSwitch: React.FC<Props> = (props: Props) => {
  const {
    isDisabled,
    selectedShareScope,
    selectedAccessScope,
    onSelect,
  } = props;
  const [selectedScope, setSelectedScope] = useState<ShareScopeSwitchType>(ShareScopeSwitchType.SAME_AS_ACCESS_SCOPE);

  const checkShareScopeRadioHandler = useCallback((shareScope: ShareScopeSwitchType) => {
    setSelectedScope(shareScope);
    if (shareScope === ShareScopeSwitchType.SAME_AS_ACCESS_SCOPE) {
      onSelect(selectedAccessScope, AiAssistantScopeType.SHARE);
      return;
    }

    onSelect(shareScope, AiAssistantScopeType.SHARE);
  }, [onSelect, selectedAccessScope]);


  return (
    <div className="mb-4">
      <Label className="text-secondary mb-3">アシスタントの共有範囲</Label>
      <div className="d-flex flex-column gap-3">
        <FormGroup check>
          <Input
            type="radio"
            name="shareScope"
            id="shareAll"
            className="form-check-input"
            disabled={isDisabled}
            onChange={() => checkShareScopeRadioHandler(ShareScopeSwitchType.PUBLIC_ONLY)}
            checked={selectedScope === ShareScopeSwitchType.PUBLIC_ONLY}
          />
          <Label check for="shareAll" className="d-flex flex-column">
            <span>全体公開</span>
            <small className="text-secondary">全てのユーザーに共有されます</small>
          </Label>
        </FormGroup>

        <FormGroup check>
          <Input
            type="radio"
            name="shareScope"
            id="shareGroup"
            className="form-check-input"
            disabled={isDisabled}
            onChange={() => checkShareScopeRadioHandler(ShareScopeSwitchType.GROUPS)}
            checked={selectedScope === ShareScopeSwitchType.GROUPS}
          />
          <Label check for="shareGroup" className="d-flex flex-column">
            <span>グループを指定</span>
            <small className="text-secondary">選択したグループのメンバーにのみ共有されます</small>
          </Label>
        </FormGroup>

        <FormGroup check>
          <Input
            type="radio"
            name="shareScope"
            id="shareAccess"
            className="form-check-input"
            disabled={isDisabled}
            onChange={() => checkShareScopeRadioHandler(ShareScopeSwitchType.SAME_AS_ACCESS_SCOPE)}
            checked={selectedScope === ShareScopeSwitchType.SAME_AS_ACCESS_SCOPE}
          />
          <Label check for="shareAccess" className="d-flex flex-column">
            <span>ページのアクセス権限と同じ範囲</span>
            <small className="text-secondary">ページのアクセス権限と同じ範囲で共有されます</small>
          </Label>
        </FormGroup>
      </div>
    </div>
  );
};
