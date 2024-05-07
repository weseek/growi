import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageYjsData } from '~/stores/yjs';

export const useCurrentPageYjsDataEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { updateHasRevisionBodyDiff, updateAwarenessStateSize } = useCurrentPageYjsData();

  const yjsHasRevisionBodyDiffUpdateHandler = useCallback((hasRevisionBodyDiff: boolean) => {
    updateHasRevisionBodyDiff(hasRevisionBodyDiff);
  }, [updateHasRevisionBodyDiff]);

  const yjsAwarenessStateUpdateHandler = useCallback(((awarenessStateSize: number) => {
    updateAwarenessStateSize(awarenessStateSize);
  }), [updateAwarenessStateSize]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsHasRevisionBodyDiffUpdated, yjsHasRevisionBodyDiffUpdateHandler);
    socket.on(SocketEventName.YjsAwarenessStateUpdated, yjsAwarenessStateUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsHasRevisionBodyDiffUpdated, yjsHasRevisionBodyDiffUpdateHandler);
      socket.off(SocketEventName.YjsAwarenessStateUpdated, yjsAwarenessStateUpdateHandler);
    };

  }, [socket, yjsAwarenessStateUpdateHandler, yjsHasRevisionBodyDiffUpdateHandler]);
};
