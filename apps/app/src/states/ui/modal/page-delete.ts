import type { IPageToDeleteWithMeta } from '@growi/core';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

import type { OnDeletedFunction } from '../../../interfaces/ui';

// Type definitions
export type IDeleteModalOption = {
  onDeleted?: OnDeletedFunction;
};

export type DeleteModalStatus = {
  isOpened: boolean;
  pages?: IPageToDeleteWithMeta[];
  opts?: IDeleteModalOption;
};

export type DeleteModalUtils = {
  open: (pages?: IPageToDeleteWithMeta[], opts?: IDeleteModalOption) => void;
  close: () => void;
};

// Atom for page delete modal
const pageDeleteModalAtom = atom<DeleteModalStatus>({
  isOpened: false,
  pages: [],
});

/**
 * Hook for managing page delete modal state
 * Used for deleting single or multiple pages
 */
export const usePageDeleteModal = (): {
  data: DeleteModalStatus;
} & DeleteModalUtils => {
  const [status, setStatus] = useAtom(pageDeleteModalAtom);

  const open = useCallback(
    (pages?: IPageToDeleteWithMeta[], opts?: IDeleteModalOption) => {
      setStatus({ isOpened: true, pages, opts });
    },
    [setStatus],
  );

  const close = useCallback(() => {
    setStatus({ isOpened: false, pages: [] });
  }, [setStatus]);

  return {
    data: status,
    open,
    close,
  };
};
