import { useCallback, useEffect } from 'react';

import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageId } from '~/stores/page';
import { useSetRemoteLatestPageData } from '~/stores/remote-latest-page';
import { useGlobalSocket } from '~/stores/websocket';

export const usePageUpdatedEffect = (): void => {

  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();

  const { data: socket } = useGlobalSocket();
  const { data: currentPageId } = useCurrentPageId();

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

    if (currentPageId != null && currentPageId === s2cMessagePageUpdated.pageId) {
      setRemoteLatestPageData(remoteData);
    }

  }, [currentPageId, setRemoteLatestPageData]);

  // listen socket for someone updating this page
  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.PageUpdated, setLatestRemotePageData);

    return () => {
      socket.off(SocketEventName.PageUpdated, setLatestRemotePageData);
    };

  }, [setLatestRemotePageData, socket]);
};
