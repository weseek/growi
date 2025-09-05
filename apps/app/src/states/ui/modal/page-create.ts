import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

// Type definitions
export type CreateModalStatus = {
  isOpened: boolean;
  path?: string;
};

export type CreateModalUtils = {
  open: (path?: string) => void;
  close: () => void;
};

// Atom for page create modal
const pageCreateModalAtom = atom<CreateModalStatus>({ isOpened: false });

/**
 * Hook for managing page create modal state
 * Used for creating new pages with optional path specification
 */
export const usePageCreateModal = (): { data: CreateModalStatus } & CreateModalUtils => {
  const [status, setStatus] = useAtom(pageCreateModalAtom);
  
  const open = useCallback((path?: string) => {
    setStatus({ isOpened: true, path });
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
