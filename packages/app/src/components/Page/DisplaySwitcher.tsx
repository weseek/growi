import React, { useCallback, useEffect, useMemo } from 'react';

import dynamic from 'next/dynamic';


import { SocketEventName } from '~/interfaces/websocket';
import {
  useCurrentPageId,
  useIsEditable,
} from '~/stores/context';
import { useIsHackmdDraftUpdatingInRealtime } from '~/stores/hackmd';
import { useSetRemoteLatestPageData } from '~/stores/remote-latest-page';
import { EditorMode, useEditorMode } from '~/stores/ui';
import { useGlobalSocket } from '~/stores/websocket';

import CustomTabContent from '../CustomNavigation/CustomTabContent';
import { Page } from '../Page';


const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorByHackmd = dynamic(() => import('../PageEditorByHackmd').then(mod => mod.PageEditorByHackmd), { ssr: false });
const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });
const HashChanged = dynamic(() => import('../EventListeneres/HashChanged'), { ssr: false });


const DisplaySwitcher = React.memo((): JSX.Element => {

  const { data: currentPageId } = useCurrentPageId();
  const { data: editorMode = EditorMode.View } = useEditorMode();
  const { data: isEditable } = useIsEditable();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  const { mutate: mutateIsHackmdDraftUpdatingInRealtime } = useIsHackmdDraftUpdatingInRealtime();

  const { data: socket } = useGlobalSocket();

  const isViewMode = editorMode === EditorMode.View;

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
    if (s2cMessagePageUpdated.pageId === currentPageId) {
      mutateIsHackmdDraftUpdatingInRealtime(true);
    }
  }, [currentPageId, mutateIsHackmdDraftUpdatingInRealtime]);

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

  const navTabMapping = useMemo(() => {
    return {
      [EditorMode.View]: {
        Content: () => (
          <div data-testid="page-view" id="page-view">
            <Page />
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
