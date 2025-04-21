import { useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageYjsData } from '~/stores/yjs';

export const useCurrentPageYjsDataEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { updateHasYdocsNewerThanLatestRevision, updateAwarenessStateSize } = useCurrentPageYjsData();

  useEffect(() => {
    if (socket == null) {
      return;
    }

    socket.on(SocketEventName.YjsHasYdocsNewerThanLatestRevisionUpdated, updateHasYdocsNewerThanLatestRevision);
    socket.on(SocketEventName.YjsAwarenessStateSizeUpdated, updateAwarenessStateSize);

    return () => {
      socket.off(SocketEventName.YjsHasYdocsNewerThanLatestRevisionUpdated, updateHasYdocsNewerThanLatestRevision);
      socket.off(SocketEventName.YjsAwarenessStateSizeUpdated, updateAwarenessStateSize);
    };
  }, [socket, updateAwarenessStateSize, updateHasYdocsNewerThanLatestRevision]);
};
