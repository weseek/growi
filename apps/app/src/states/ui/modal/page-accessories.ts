import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

// Constants to match the original implementation
export const PageAccessoriesModalContents = {
  PageHistory: 'PageHistory',
  Attachment: 'Attachment',
  ShareLink: 'ShareLink',
} as const;
export type PageAccessoriesModalContents =
  (typeof PageAccessoriesModalContents)[keyof typeof PageAccessoriesModalContents];

// Type definitions to match the original implementation
export type PageAccessoriesModalStatus = {
  isOpened: boolean;
  activatedContents?: PageAccessoriesModalContents;
};

export type PageAccessoriesModalUtils = {
  open: (activatedContents: PageAccessoriesModalContents) => void;
  close: () => void;
  selectContents: (activatedContents: PageAccessoriesModalContents) => void;
};

// Atom for page accessories modal
const pageAccessoriesModalAtom = atom<PageAccessoriesModalStatus>({
  isOpened: false,
});

/**
 * Hook for managing page accessories modal state
 */
export const usePageAccessoriesModal = (): {
  data: PageAccessoriesModalStatus;
} & PageAccessoriesModalUtils => {
  const [status, setStatus] = useAtom(pageAccessoriesModalAtom);

  const open = useCallback(
    (activatedContents: PageAccessoriesModalContents) => {
      setStatus({ isOpened: true, activatedContents });
    },
    [setStatus],
  );

  const close = useCallback(() => {
    setStatus({ isOpened: false });
  }, [setStatus]);

  const selectContents = useCallback(
    (activatedContents: PageAccessoriesModalContents) => {
      setStatus((current) => ({ ...current, activatedContents }));
    },
    [setStatus],
  );

  return {
    data: status,
    open,
    close,
    selectContents,
  };
};
