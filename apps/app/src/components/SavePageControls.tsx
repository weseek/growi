import React, { useCallback } from 'react';

import EventEmitter from 'events';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { IPageGrantData } from '~/interfaces/page';
import {
  useIsEditable, useIsAclEnabled,
} from '~/stores/context';
import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';
import { useSelectedGrant } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import GrantSelector from './SavePageControls/GrantSelector';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


const logger = loggerFactory('growi:SavePageControls');

const { isTopPage } = pagePathUtils;

export type SavePageControlsProps = {
  slackChannels: string
}

export const SavePageControls = (props: SavePageControlsProps): JSX.Element | null => {
  const { slackChannels } = props;
  const { t } = useTranslation();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isEditable } = useIsEditable();
  const { data: isAclEnabled } = useIsAclEnabled();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: pageId } = useCurrentPageId();


  const updateGrantHandler = useCallback((grantData: IPageGrantData): void => {
    mutateGrant(grantData);
  }, [mutateGrant]);

  const save = useCallback(async(): Promise<void> => {
    // save
    globalEmitter.emit('saveAndReturnToView', { slackChannels });
  }, [slackChannels]);

  const saveAndOverwriteScopesOfDescendants = useCallback(() => {
    // save
    globalEmitter.emit('saveAndReturnToView', { overwriteScopesOfDescendants: true, slackChannels });
  }, [slackChannels]);


  if (isEditable == null || isAclEnabled == null || grantData == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  const { grant, grantedGroup } = grantData;

  const isRootPage = isTopPage(currentPagePath ?? '');
  const labelSubmitButton = pageId == null ? t('Create') : t('Update');
  const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });

  return (
    <div className="d-flex align-items-center form-inline flex-nowrap">

      {isAclEnabled
          && (
            <div className="mr-2">
              <GrantSelector
                grant={grant}
                disabled={isRootPage}
                grantGroupId={grantedGroup?.id}
                grantGroupName={grantedGroup?.name}
                onUpdateGrant={updateGrantHandler}
              />
            </div>
          )
      }

      <UncontrolledButtonDropdown direction="up">
        <Button data-testid="save-page-btn" id="caret" color="primary" className="btn-submit" onClick={save}>
          {labelSubmitButton}
        </Button>
        <DropdownToggle caret color="primary" />
        <DropdownMenu end>
          <DropdownItem onClick={saveAndOverwriteScopesOfDescendants}>
            {labelOverwriteScopes}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

    </div>
  );
};
