import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

// Type definitions
export type ShortcutsModalStatus = {
  isOpened: boolean;
};

export type ShortcutsModalUtils = {
  open: () => void;
  close: () => void;
};

// Atom for shortcuts modal
const shortcutsModalAtom = atom<ShortcutsModalStatus>({
  isOpened: false,
});

/**
 * Hook for managing shortcuts modal state
 */
export const useShortcutsModal = (): {
  data: ShortcutsModalStatus;
} & ShortcutsModalUtils => {
  const [status, setStatus] = useAtom(shortcutsModalAtom);

  const open = useCallback(() => {
    setStatus({ isOpened: true });
  }, [setStatus]);

  const close = useCallback(() => {
    setStatus({ isOpened: false });
  }, [setStatus]);

  return {
    data: status,
    open,
    close,
  };
};
