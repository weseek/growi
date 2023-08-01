import React, { useCallback } from 'react';

import EventEmitter from 'events';

import { pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import type { IPageGrantData } from '~/interfaces/page';
import {
  useIsEditable, useIsAclEnabled,
} from '~/stores/context';
import { useWaitingSaveProcessing } from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
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
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: isEditable } = useIsEditable();
  const { data: isAclEnabled } = useIsAclEnabled();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: _isWaitingSaveProcessing } = useWaitingSaveProcessing();

  const isWaitingSaveProcessing = _isWaitingSaveProcessing === true; // ignore undefined

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

  const isRootPage = isTopPage(currentPage?.path ?? '');
  const labelSubmitButton = (currentPage != null && !currentPage.isEmpty) ? t('Update') : t('Create');
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
        <Button
          id="caret" data-testid="save-page-btn"
          color="primary"
          className="btn-submit"
          onClick={save}
          disabled={isWaitingSaveProcessing}
        >
          {isWaitingSaveProcessing && (
            <i className="fa fa-spinner fa-pulse mr-1"></i>
          )}
          {labelSubmitButton}
        </Button>
        <DropdownToggle caret color="primary" disabled={isWaitingSaveProcessing} />
        <DropdownMenu right>
          <DropdownItem onClick={saveAndOverwriteScopesOfDescendants}>
            {labelOverwriteScopes}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

    </div>
  );
};
