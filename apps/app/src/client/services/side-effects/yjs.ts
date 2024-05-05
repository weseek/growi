import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import type { CurrentPageYjsDraft } from '~/interfaces/page';
import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageYjsDraft, useCurrentPageYjsAwarenessStateSize } from '~/stores/page';

export const useYjsDraftEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { mutate: mutateCurrentPageYjsDraft } = useCurrentPageYjsDraft();

  const yjsDraftUpdateHandler = useCallback(((currentPageYjsDraft: CurrentPageYjsDraft) => {
    mutateCurrentPageYjsDraft(currentPageYjsDraft);
  }), [mutateCurrentPageYjsDraft]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);
    };

  }, [mutateCurrentPageYjsDraft, socket, yjsDraftUpdateHandler]);
};

export const useYjsAwarenessStateEffect = (): void => {
  const { data: socket } = useGlobalSocket();
  const { mutate: mutateCurrentPageYjsAwarenessStateSize } = useCurrentPageYjsAwarenessStateSize();

  const yjsAwarenessStateUpdateHandler = useCallback(((awarenessStateSize: number) => {
    mutateCurrentPageYjsAwarenessStateSize(awarenessStateSize);
  }), [mutateCurrentPageYjsAwarenessStateSize]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsAwarenessStateUpdated, yjsAwarenessStateUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsAwarenessStateUpdated, yjsAwarenessStateUpdateHandler);
    };

  }, [socket, yjsAwarenessStateUpdateHandler]);

};
