import React, { useCallback, useState, useEffect } from 'react';

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
  useIsSlackConfigured,
} from '~/stores/context';
import { useWaitingSaveProcessing, useSWRxSlackChannels, useIsSlackEnabled } from '~/stores/editor';
import { useSWRMUTxCurrentPage, useSWRxCurrentPage, useCurrentPagePath } from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';
import {
  useSelectedGrant,
  useEditorMode, useIsDeviceLargerThanMd,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';


import { unpublish } from '../client/services/page-operation';


import { GrantSelector } from './SavePageControls/GrantSelector';
import { SlackNotification } from './SlackNotification';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


const logger = loggerFactory('growi:SavePageControls');


export const SavePageControls = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: isEditable } = useIsEditable();
  const { data: isAclEnabled } = useIsAclEnabled();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: _isWaitingSaveProcessing } = useWaitingSaveProcessing();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

  const { data: editorMode } = useEditorMode();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isSlackConfigured } = useIsSlackConfigured();
  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);


  const [slackChannels, setSlackChannels] = useState<string>('');

  // DO NOT dependent on slackChannelsData directly: https://github.com/weseek/growi/pull/7332
  const slackChannelsDataString = slackChannelsData?.toString();
  useEffect(() => {
    if (editorMode === 'editor') {
      setSlackChannels(slackChannelsDataString ?? '');
      mutateIsSlackEnabled(false);
    }
  }, [editorMode, mutateIsSlackEnabled, slackChannelsDataString]);

  const isWaitingSaveProcessing = _isWaitingSaveProcessing === true; // ignore undefined


  const isSlackEnabledToggleHandler = (bool: boolean) => {
    mutateIsSlackEnabled(bool, false);
  };

  const slackChannelsChangedHandler = useCallback((slackChannels: string) => {
    setSlackChannels(slackChannels);
  }, []);


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

      {isSlackConfigured && (
        <div className="me-2">
          {isSlackEnabled != null
              && (
                <SlackNotification
                  isSlackEnabled={isSlackEnabled}
                  slackChannels={slackChannels}
                  onEnabledFlagChange={isSlackEnabledToggleHandler}
                  onChannelChange={slackChannelsChangedHandler}
                  id="idForEditorNavbarBottom"
                />
              )}
        </div>
      )
      }

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
            <i className="fa fa-spinner fa-pulse me-1"></i>
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
