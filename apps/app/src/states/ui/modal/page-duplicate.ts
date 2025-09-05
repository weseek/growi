import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

import type { OnDuplicatedFunction } from '../../../interfaces/ui';

// Type definitions to match the original implementation
export type IPageForPageDuplicateModal = {
  pageId: string;
  path: string;
};

export type IDuplicateModalOption = {
  onDuplicated?: OnDuplicatedFunction;
};

export type DuplicateModalStatus = {
  isOpened: boolean;
  page?: IPageForPageDuplicateModal;
  opts?: IDuplicateModalOption;
};

export type DuplicateModalUtils = {
  open: (
    page?: IPageForPageDuplicateModal,
    opts?: IDuplicateModalOption,
  ) => void;
  close: () => void;
};

// Atom for page duplicate modal
const pageDuplicateModalAtom = atom<DuplicateModalStatus>({
  isOpened: false,
});

/**
 * Hook for managing page duplicate modal state
 */
export const usePageDuplicateModal = (): {
  data: DuplicateModalStatus;
} & DuplicateModalUtils => {
  const [status, setStatus] = useAtom(pageDuplicateModalAtom);

  const open = useCallback(
    (page?: IPageForPageDuplicateModal, opts?: IDuplicateModalOption) => {
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
