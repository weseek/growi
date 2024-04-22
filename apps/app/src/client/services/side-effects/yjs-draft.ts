import { useCallback, useEffect } from 'react';

import { useGlobalSocket } from '@growi/core/dist/swr';

import type { CurrentPageYjsDraft } from '~/interfaces/page';
import { SocketEventName } from '~/interfaces/websocket';
import { useCurrentPageYjsDraft } from '~/stores/page';

export const useYjsDraftEffect = (): void => {
  const { mutate: mutateeCurrentPageYjsDraft } = useCurrentPageYjsDraft();
  const { data: socket } = useGlobalSocket();

  const yjsDraftUpdateHandler = useCallback(((currentPageYjsDraft: CurrentPageYjsDraft) => {
    mutateeCurrentPageYjsDraft(currentPageYjsDraft);
  }), [mutateeCurrentPageYjsDraft]);

  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);

    return () => {
      socket.off(SocketEventName.YjsUpdated, yjsDraftUpdateHandler);
    };

  }, [mutateeCurrentPageYjsDraft, socket, yjsDraftUpdateHandler]);
};
