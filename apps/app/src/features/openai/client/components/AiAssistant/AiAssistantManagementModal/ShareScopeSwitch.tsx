import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
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
  isDisabledGroups: boolean,
  selectedShareScope: AiAssistantShareScope,
  selectedAccessScope: AiAssistantAccessScope,
  onSelect: (shareScope: AiAssistantShareScope, scopeType: AiAssistantScopeType) => void,
}

export const ShareScopeSwitch: React.FC<Props> = (props: Props) => {
  const {
    isDisabled,
    isDisabledGroups,
    selectedShareScope,
    selectedAccessScope,
    onSelect,
  } = props;

  const { t } = useTranslation();

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

        {[ShareScopeSwitchType.PUBLIC_ONLY, ShareScopeSwitchType.GROUPS, ShareScopeSwitchType.SAME_AS_ACCESS_SCOPE].map(shareScope => (
          <FormGroup check key={shareScope}>
            <Input
              type="radio"
              name="shareScope"
              id="shareGroup"
              className="form-check-input"
              disabled={isDisabled || (isDisabledGroups && shareScope === ShareScopeSwitchType.GROUPS)}
              onChange={() => checkShareScopeRadioHandler(shareScope)}
              checked={selectedScope === shareScope}
            />
            <Label check for="shareGroup" className="d-flex flex-column">
              <span>{t(`modal_ai_assistant.share_scope.${shareScope}.label`)}</span>
              <small className="text-secondary">{t(`modal_ai_assistant.share_scope.${shareScope}.desc`)}</small>
            </Label>
          </FormGroup>
        ))}
      </div>
    </div>
  );
};
