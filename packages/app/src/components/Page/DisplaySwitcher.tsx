import React, { useCallback, useEffect, useMemo } from 'react';

import { pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';

import { SocketEventName } from '~/interfaces/websocket';
import {
  useIsEditable, useShareLinkId, useIsNotFound,
} from '~/stores/context';
import { useIsHackmdDraftUpdatingInRealtime } from '~/stores/hackmd';
import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';
import {
  useSetRemoteLatestPageData,
} from '~/stores/remote-latest-page';
import { EditorMode, useEditorMode } from '~/stores/ui';
import { useGlobalSocket } from '~/stores/websocket';

import CustomTabContent from '../CustomNavigation/CustomTabContent';
import { Page } from '../Page';
import { UserInfoProps } from '../User/UserInfo';

const { isUsersHomePage } = pagePathUtils;


const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorByHackmd = dynamic(() => import('../PageEditorByHackmd').then(mod => mod.PageEditorByHackmd), { ssr: false });
const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });
const HashChanged = dynamic(() => import('../EventListeneres/HashChanged'), { ssr: false });
const NotFoundPage = dynamic(() => import('../NotFoundPage'), { ssr: false });
const UserInfo = dynamic<UserInfoProps>(() => import('../User/UserInfo').then(mod => mod.UserInfo), { ssr: false });


const PageView = React.memo((): JSX.Element => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: shareLinkId } = useShareLinkId();
  const { data: isNotFound } = useIsNotFound();
  const { data: currentPage } = useSWRxCurrentPage();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();

  const { mutate: mutateIsHackmdDraftUpdatingInRealtime } = useIsHackmdDraftUpdatingInRealtime();

  const isUsersHomePagePath = isUsersHomePage(currentPagePath ?? '');

  const { data: socket } = useGlobalSocket();

  const setLatestRemotePageData = useCallback((data) => {
    const { s2cMessagePageUpdated } = data;

    const remoteData = {
      remoteRevisionId: s2cMessagePageUpdated.revisionId,
      remoteRevisionBody: s2cMessagePageUpdated.revisionBody,
      remoteRevisionLastUpdateUser: s2cMessagePageUpdated.remoteLastUpdateUser,
      remoteRevisionLastUpdatedAt: s2cMessagePageUpdated.revisionUpdateAt,
      revisionIdHackmdSynced: s2cMessagePageUpdated.revisionIdHackmdSynced,
      hasDraftOnHackmd: s2cMessagePageUpdated.hasDraftOnHackmd,
    };
    setRemoteLatestPageData(remoteData);
  }, [setRemoteLatestPageData]);

  const setIsHackmdDraftUpdatingInRealtime = useCallback((data) => {
    const { s2cMessagePageUpdated } = data;
    if (s2cMessagePageUpdated.pageId === currentPage?._id) {
      mutateIsHackmdDraftUpdatingInRealtime(true);
    }
  }, [currentPage?._id, mutateIsHackmdDraftUpdatingInRealtime]);

  // listen socket for someone updating this page
  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.PageUpdated, setLatestRemotePageData);

    return () => {
      socket.off(SocketEventName.PageUpdated, setLatestRemotePageData);
    };

  }, [setLatestRemotePageData, socket]);

  // listen socket for hackmd saved
  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.EditingWithHackmd, setIsHackmdDraftUpdatingInRealtime);

    return () => {
      socket.off(SocketEventName.EditingWithHackmd, setIsHackmdDraftUpdatingInRealtime);
    };
  }, [setIsHackmdDraftUpdatingInRealtime, socket]);

  return (
    <>
      { isUsersHomePagePath && <UserInfo author={currentPage?.creator} /> }
      { !isNotFound && <Page currentPage={currentPage ?? undefined} /> }
      { isNotFound && <NotFoundPage /> }
    </>
  );
});
PageView.displayName = 'PageView';


const DisplaySwitcher = React.memo((): JSX.Element => {

  const { data: isEditable } = useIsEditable();

  const { data: editorMode = EditorMode.View } = useEditorMode();

  const isViewMode = editorMode === EditorMode.View;

  const navTabMapping = useMemo(() => {
    return {
      [EditorMode.View]: {
        Content: () => (
          <div data-testid="page-view" id="page-view">
            <PageView />
          </div>
        ),
      },
      [EditorMode.Editor]: {
        Content: () => (
          isEditable
            ? (
              <div data-testid="page-editor" id="page-editor">
                <PageEditor />
              </div>
            )
            : <></>
        ),
      },
      [EditorMode.HackMD]: {
        Content: () => (
          isEditable
            ? (
              <div id="page-editor-with-hackmd">
                <PageEditorByHackmd />
              </div>
            )
            : <></>
        ),
      },
    };
  }, [isEditable]);


  return (
    <>
      <CustomTabContent activeTab={editorMode} navTabMapping={navTabMapping} />

      { isEditable && !isViewMode && <EditorNavbarBottom /> }
      { isEditable && <HashChanged></HashChanged> }
    </>
  );
});
DisplaySwitcher.displayName = 'DisplaySwitcher';

export default DisplaySwitcher;
