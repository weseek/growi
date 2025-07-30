import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageData, usePageFetcher } from '~/states/page';
import { useEditorMode, EditorMode } from '~/stores-universal/ui';
import { usePageStatusAlert } from '~/stores/alert';
import { useSetRemoteLatestPageData, type RemoteRevisionData } from '~/stores/remote-latest-page';


export const usePageUpdatedEffect = (): void => {

  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();

  const { data: socket } = useGlobalSocket();
  const { data: editorMode } = useEditorMode();
  const [currentPage] = useCurrentPageData();
  const { fetchAndUpdatePage } = usePageFetcher();
  const { open: openPageStatusAlert, close: closePageStatusAlert } = usePageStatusAlert();

  const remotePageDataUpdateHandler = useCallback((data) => {
    // Set remote page data
    const { s2cMessagePageUpdated } = data;

    const remoteData: RemoteRevisionData = {
      remoteRevisionId: s2cMessagePageUpdated.revisionId,
      remoteRevisionBody: s2cMessagePageUpdated.revisionBody,
      remoteRevisionLastUpdateUser: s2cMessagePageUpdated.remoteLastUpdateUser,
      remoteRevisionLastUpdatedAt: s2cMessagePageUpdated.revisionUpdateAt,
    };

    if (currentPage?._id != null && currentPage._id === s2cMessagePageUpdated.pageId) {
      setRemoteLatestPageData(remoteData);

      // Open PageStatusAlert
      const currentRevisionId = currentPage?.revision?._id;
      const remoteRevisionId = s2cMessagePageUpdated.revisionId;
      const isRevisionOutdated = (currentRevisionId != null || remoteRevisionId != null) && currentRevisionId !== remoteRevisionId;

      // !!CAUTION!! Timing of calling openPageStatusAlert may clash with components/PageEditor/conflict.tsx
      if (isRevisionOutdated && editorMode === EditorMode.View) {
        openPageStatusAlert({ hideEditorMode: EditorMode.Editor, onRefleshPage: fetchAndUpdatePage });
      }

      // Clear cache
      if (!isRevisionOutdated) {
        closePageStatusAlert();
      }
    }
  }, [currentPage?._id, currentPage?.revision?._id, editorMode, fetchAndUpdatePage, openPageStatusAlert, closePageStatusAlert, setRemoteLatestPageData]);

  // listen socket for someone updating this page
  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.PageUpdated, remotePageDataUpdateHandler);

    return () => {
      socket.off(SocketEventName.PageUpdated, remotePageDataUpdateHandler);
    };

  }, [remotePageDataUpdateHandler, socket]);
};
