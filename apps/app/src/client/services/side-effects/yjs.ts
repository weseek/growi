import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageYjsData } from '~/stores/yjs';

export const useCurrentPageYjsDataEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { updateHasDraft, updateHasRevisionBodyDiff, updateAwarenessStateSize } = useCurrentPageYjsData();

  const hasDraftUpdateHandler = useCallback((hasDraft: boolean) => {
    updateHasDraft(hasDraft);
  }, [updateHasDraft]);

  const hasRevisionBodyDiffUpdateHandler = useCallback((hasRevisionBodyDiff: boolean) => {
    updateHasRevisionBodyDiff(hasRevisionBodyDiff);
  }, [updateHasRevisionBodyDiff]);

  const awarenessStateSizeUpdateHandler = useCallback(((awarenessStateSize: number) => {
    updateAwarenessStateSize(awarenessStateSize);
  }), [updateAwarenessStateSize]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsHasDraftUpdated, hasDraftUpdateHandler);
    socket.on(SocketEventName.YjsHasRevisionBodyDiffUpdated, hasRevisionBodyDiffUpdateHandler);
    socket.on(SocketEventName.YjsAwarenessStateSizeUpdated, awarenessStateSizeUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsHasDraftUpdated);
      socket.off(SocketEventName.YjsHasRevisionBodyDiffUpdated, hasRevisionBodyDiffUpdateHandler);
      socket.off(SocketEventName.YjsAwarenessStateSizeUpdated, awarenessStateSizeUpdateHandler);
    };

  }, [socket, awarenessStateSizeUpdateHandler, hasRevisionBodyDiffUpdateHandler, hasDraftUpdateHandler]);
};
