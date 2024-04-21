import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import { SocketEventName } from '~/interfaces/websocket';
import { useHasYjsDraft } from '~/stores/page';

export const useYjsDraftEffect = (): void => {

  const { mutate: mutateHasYjsDraft } = useHasYjsDraft();
  const { data: socket } = useGlobalSocket();

  const yjsDraftUpdateHandler = useCallback(((hasYjsDraft: boolean) => {
    mutateHasYjsDraft(hasYjsDraft);
  }), [mutateHasYjsDraft]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);
    };

  }, [mutateHasYjsDraft, socket, yjsDraftUpdateHandler]);
};
