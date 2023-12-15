import { useCallback, useEffect } from 'react';

import { SocketEventName } from '~/interfaces/websocket';
import { useIsHackmdDraftUpdatingInRealtime } from '~/stores/hackmd';
import { useCurrentPageId } from '~/stores/page';
import { useGlobalSocket } from '~/stores/websocket';

export const useHackmdDraftUpdatedEffect = (): void => {

  const { data: currentPageId } = useCurrentPageId();
  const { mutate: mutateIsHackmdDraftUpdatingInRealtime } = useIsHackmdDraftUpdatingInRealtime();

  const { data: socket } = useGlobalSocket();

  const setIsHackmdDraftUpdatingInRealtime = useCallback((data) => {
    const { s2cMessagePageUpdated } = data;
    if (s2cMessagePageUpdated.pageId === currentPageId) {
      mutateIsHackmdDraftUpdatingInRealtime(true);
    }
  }, [currentPageId, mutateIsHackmdDraftUpdatingInRealtime]);

  // listen socket for hackmd saved
  useEffect(() => {

    if (socket == null) { return }

    socket.on(SocketEventName.EditingWithHackmd, setIsHackmdDraftUpdatingInRealtime);

    return () => {
      socket.off(SocketEventName.EditingWithHackmd, setIsHackmdDraftUpdatingInRealtime);
    };
  }, [setIsHackmdDraftUpdatingInRealtime, socket]);
};
