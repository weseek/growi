import React, { useCallback } from 'react';

import type EventEmitter from 'events';

import { isTopPage, isUsersProtectedPages } from '@growi/core/dist/utils/page-path-utils';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/toastr';
import type { IPageGrantData } from '~/interfaces/page';
import {
  useIsEditable, useIsAclEnabled,
} from '~/stores/context';
import { useWaitingSaveProcessing } from '~/stores/editor';
import { useSWRMUTxCurrentPage, useSWRxCurrentPage } from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';
import { useSelectedGrant } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import { unpublish } from '../client/services/page-operation';

import { LoadingSpinnerPulse } from './LoadingSpinnerPulse';
import { GrantSelector } from './SavePageControls/GrantSelector';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


const logger = loggerFactory('growi:SavePageControls');

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
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

  const isWaitingSaveProcessing = true;// _isWaitingSaveProcessing === true; // ignore undefined

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

  const clickUnpublishButtonHandler = useCallback(async() => {
    const pageId = currentPage?._id;

    if (pageId == null) {
      return;
    }

    try {
      await unpublish(pageId);
      await mutateCurrentPage();
      await mutatePageTree();
      toastSuccess(t('wip_page.success_save_as_wip'));
    }
    catch (err) {
      logger.error(err);
      toastError(t('wip_page.fail_save_as_wip'));
    }
  }, [currentPage?._id, mutateCurrentPage, t]);


  if (isEditable == null || isAclEnabled == null || grantData == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  const { grant, userRelatedGrantedGroups } = grantData;

  const isGrantSelectorDisabledPage = isTopPage(currentPage?.path ?? '') || isUsersProtectedPages(currentPage?.path ?? '');
  const labelSubmitButton = t('Update');
  const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });
  const labelUnpublishPage = t('wip_page.save_as_wip');

  return (
    <div className="d-flex align-items-center flex-nowrap">

      {isAclEnabled
        && (
          <div className="me-2">
            <GrantSelector
              grant={grant}
              disabled={isGrantSelectorDisabledPage}
              userRelatedGrantedGroups={userRelatedGrantedGroups}
              onUpdateGrant={updateGrantHandler}
            />
          </div>
        )
      }

      <UncontrolledButtonDropdown direction="up" size="sm">
        <Button
          id="caret"
          data-testid="save-page-btn"
          color="primary"
          className="btn-submit"
          onClick={save}
          disabled={isWaitingSaveProcessing}
        >
          {isWaitingSaveProcessing && (
            <LoadingSpinnerPulse />
          )}
          {labelSubmitButton}
        </Button>
        <DropdownToggle caret color="primary" disabled={isWaitingSaveProcessing} />
        <DropdownMenu container="body" end>
          <DropdownItem onClick={saveAndOverwriteScopesOfDescendants}>
            {labelOverwriteScopes}
          </DropdownItem>
          <DropdownItem onClick={clickUnpublishButtonHandler}>
            {labelUnpublishPage}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

    </div>
  );
};
