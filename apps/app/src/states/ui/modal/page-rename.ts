import type { IPageToRenameWithMeta } from '@growi/core';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

import type { OnRenamedFunction } from '../../../interfaces/ui';

// Type definitions to match the original implementation
export type IRenameModalOption = {
  onRenamed?: OnRenamedFunction;
};

export type RenameModalStatus = {
  isOpened: boolean;
  page?: IPageToRenameWithMeta;
  opts?: IRenameModalOption;
};

export type RenameModalUtils = {
  open: (page?: IPageToRenameWithMeta, opts?: IRenameModalOption) => void;
  close: () => void;
};

// Atom for page rename modal
const pageRenameModalAtom = atom<RenameModalStatus>({
  isOpened: false,
});

/**
 * Hook for managing page rename modal state
 */
export const usePageRenameModal = (): {
  data: RenameModalStatus;
} & RenameModalUtils => {
  const [status, setStatus] = useAtom(pageRenameModalAtom);

  const open = useCallback(
    (page?: IPageToRenameWithMeta, opts?: IRenameModalOption) => {
      setStatus({ isOpened: true, page, opts });
    },
    [setStatus],
  );

  const close = useCallback(() => {
    setStatus({ isOpened: false });
  }, [setStatus]);

  return {
    data: status,
    open,
    close,
  };
};
