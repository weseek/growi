import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  Input, Label, FormGroup,
} from 'reactstrap';

import type { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';
import { AiAssistantShareScope, AiAssistantScopeType } from '../../../../interfaces/ai-assistant';


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
    onSelect,
  } = props;

  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <Label className="text-secondary mb-3">アシスタントの共有範囲</Label>
      <div className="d-flex flex-column gap-3">

        {[AiAssistantShareScope.PUBLIC_ONLY, AiAssistantShareScope.GROUPS, AiAssistantShareScope.SAME_AS_ACCESS_SCOPE].map(shareScope => (
          <FormGroup check key={shareScope}>
            <Input
              type="radio"
              name="shareScope"
              id="shareGroup"
              className="form-check-input"
              disabled={isDisabled || (isDisabledGroups && shareScope === AiAssistantShareScope.GROUPS)}
              onChange={() => onSelect(shareScope, AiAssistantScopeType.SHARE)}
              checked={selectedShareScope === shareScope}
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
