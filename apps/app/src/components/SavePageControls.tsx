import React, { useCallback, useState, useEffect } from 'react';

import type EventEmitter from 'events';

import { isTopPage, isUsersProtectedPages } from '@growi/core/dist/utils/page-path-utils';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem, Modal,
} from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/toastr';
import {
  useIsEditable, useIsAclEnabled,
  useIsSlackConfigured,
} from '~/stores/context';
import { useWaitingSaveProcessing, useSWRxSlackChannels, useIsSlackEnabled } from '~/stores/editor';
import { useSWRMUTxCurrentPage, useSWRxCurrentPage, useCurrentPagePath } from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';
import {
  useEditorMode, useIsDeviceLargerThanMd,
  EditorMode,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';


import { unpublish } from '../client/services/page-operation';

import { LoadingSpinner } from './LoadingSpinner';
import { GrantSelector } from './SavePageControls/GrantSelector';
import { SlackNotification } from './SlackNotification';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


const logger = loggerFactory('growi:SavePageControls');


const SavePageButton = (props: {slackChannels: string, isDeviceLargerThanMd?: boolean}) => {

  const { t } = useTranslation();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: _isWaitingSaveProcessing } = useWaitingSaveProcessing();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();
  const { mutate: mutateEditorMode } = useEditorMode();
  const [isSavePageModalShown, setIsSavePageModalShown] = useState<boolean>(false);

  const { slackChannels, isDeviceLargerThanMd } = props;

  const isWaitingSaveProcessing = _isWaitingSaveProcessing === true; // ignore undefined

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
      await mutateEditorMode(EditorMode.View);
      toastSuccess(t('wip_page.success_save_as_wip'));
    }
    catch (err) {
      logger.error(err);
      toastError(t('wip_page.fail_save_as_wip'));
    }
  }, [currentPage?._id, mutateCurrentPage, mutateEditorMode, t]);

  const labelSubmitButton = t('Update');
  const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });
  const labelUnpublishPage = t('wip_page.save_as_wip');

  return (
    <>
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
            <LoadingSpinner />
          )}
          {labelSubmitButton}
        </Button>
        {
          isDeviceLargerThanMd ? (
            <>
              <DropdownToggle caret color="primary" disabled={isWaitingSaveProcessing} />
              <DropdownMenu container="body" end>
                <DropdownItem onClick={saveAndOverwriteScopesOfDescendants}>
                  {labelOverwriteScopes}
                </DropdownItem>
                <DropdownItem onClick={clickUnpublishButtonHandler}>
                  {labelUnpublishPage}
                </DropdownItem>
              </DropdownMenu>
            </>
          ) : (
            <>
              <DropdownToggle caret color="primary" disabled={isWaitingSaveProcessing} onClick={() => setIsSavePageModalShown(true)} />
              <Modal
                centered
                isOpen={isSavePageModalShown}
                toggle={() => setIsSavePageModalShown(false)}
              >
                <div className="d-flex flex-column pt-4 pb-3 px-4 gap-4">
                  <button type="button" className="btn btn-primary" onClick={() => { setIsSavePageModalShown(false); saveAndOverwriteScopesOfDescendants() }}>
                    {labelOverwriteScopes}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => { setIsSavePageModalShown(false); clickUnpublishButtonHandler() }}>
                    {labelUnpublishPage}
                  </button>
                  <button type="button" className="btn btn-outline-neutral-secondary mx-auto mt-1" onClick={() => setIsSavePageModalShown(false)}>
                    <label className="mx-2">
                      {t('Cancel')}
                    </label>
                  </button>
                </div>
              </Modal>
            </>
          )
        }
      </UncontrolledButtonDropdown>
    </>
  );
};


export const SavePageControls = (): JSX.Element | null => {
  const { t } = useTranslation('commons');
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: isEditable } = useIsEditable();
  const { data: isAclEnabled } = useIsAclEnabled();

  const { data: editorMode } = useEditorMode();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isSlackConfigured } = useIsSlackConfigured();
  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isDeviceLargerThanMd } = useIsDeviceLargerThanMd();

  const [slackChannels, setSlackChannels] = useState<string>('');
  const [isSavePageControlsModalShown, setIsSavePageControlsModalShown] = useState<boolean>(false);

  // DO NOT dependent on slackChannelsData directly: https://github.com/weseek/growi/pull/7332
  const slackChannelsDataString = slackChannelsData?.toString();
  useEffect(() => {
    if (editorMode === 'editor') {
      setSlackChannels(slackChannelsDataString ?? '');
      mutateIsSlackEnabled(false);
    }
  }, [editorMode, mutateIsSlackEnabled, slackChannelsDataString]);


  const isSlackEnabledToggleHandler = (bool: boolean) => {
    mutateIsSlackEnabled(bool, false);
  };

  const slackChannelsChangedHandler = useCallback((slackChannels: string) => {
    setSlackChannels(slackChannels);
  }, []);

  if (isEditable == null || isAclEnabled == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  const isGrantSelectorDisabledPage = isTopPage(currentPage?.path ?? '') || isUsersProtectedPages(currentPage?.path ?? '');

  return (
    <div className="d-flex align-items-center flex-nowrap">
      {
        isDeviceLargerThanMd ? (
          <>
            {
              isSlackConfigured && (
                <div className="me-2">
                  {isSlackEnabled != null && (
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

            {
              isAclEnabled && (
                <div className="me-2">
                  <GrantSelector disabled={isGrantSelectorDisabledPage} />
                </div>
              )
            }

            <SavePageButton slackChannels={slackChannels} isDeviceLargerThanMd />
          </>
        ) : (
          <>
            <SavePageButton slackChannels={slackChannels} />
            <button
              type="button"
              className="btn btn-outline-neutral-secondary border-0 fs-5 p-0 ms-1 text-muted"
              onClick={() => setIsSavePageControlsModalShown(true)}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            <Modal
              className="save-page-controls-modal"
              centered
              isOpen={isSavePageControlsModalShown}
            >
              <div className="d-flex flex-column pt-5 pb-3 px-4 gap-3">
                {
                  isAclEnabled && (
                    <>
                      <GrantSelector
                        disabled={isGrantSelectorDisabledPage}
                        openInModal
                      />
                    </>
                  )
                }

                {
                  isSlackConfigured && isSlackEnabled != null && (
                    <>
                      <SlackNotification
                        isSlackEnabled={isSlackEnabled}
                        slackChannels={slackChannels}
                        onEnabledFlagChange={isSlackEnabledToggleHandler}
                        onChannelChange={slackChannelsChangedHandler}
                        id="idForEditorNavbarBottom"
                      />
                    </>
                  )
                }
                <div className="d-flex">
                  <button type="button" className="mx-auto btn btn-primary rounded-1" onClick={() => setIsSavePageControlsModalShown(false)}>
                    {t('Done')}
                  </button>
                </div>
              </div>
            </Modal>
          </>
        )
      }
    </div>
  );
};
