import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import {
  Input, Label, FormGroup,
} from 'reactstrap';

import { useCurrentUser } from '~/stores-universal/context';

import { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';

type Props = {
  isDisabled: boolean,
}

export const ShareScopeSwitch: React.FC<Props> = (props: Props) => {
  const { isDisabled } = props;

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
            defaultChecked
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
