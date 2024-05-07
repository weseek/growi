import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageYjsData } from '~/stores/yjs';

export const useYjsDraftEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { updateHasDraft } = useCurrentPageYjsData();

  const yjsDraftUpdateHandler = useCallback(((hasDraft: boolean) => {
    updateHasDraft(hasDraft);
  }), [updateHasDraft]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsDraftUpdated, yjsDraftUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsDraftUpdated, yjsDraftUpdateHandler);
    };

  }, [socket, yjsDraftUpdateHandler]);
};

export const useYjsAwarenessStateEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { updateAwarenessStateSize } = useCurrentPageYjsData();

  const yjsAwarenessStateUpdateHandler = useCallback(((awarenessStateSize: number) => {
    updateAwarenessStateSize(awarenessStateSize);
  }), [updateAwarenessStateSize]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsAwarenessStateUpdated, yjsAwarenessStateUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsAwarenessStateUpdated, yjsAwarenessStateUpdateHandler);
    };

  }, [socket, yjsAwarenessStateUpdateHandler]);

};
