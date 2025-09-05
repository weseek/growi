import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

// Type definitions to match the original implementation
export type TagEditModalStatus = {
  isOpen: boolean;
  tags: string[];
  pageId: string;
  revisionId: string;
};

export type TagEditModalUtils = {
  open: (tags: string[], pageId: string, revisionId: string) => void;
  close: () => void;
};

// Atom for tag edit modal
const tagEditModalAtom = atom<TagEditModalStatus>({
  isOpen: false,
  tags: [],
  pageId: '',
  revisionId: '',
});

/**
 * Hook for managing tag edit modal state
 */
export const useTagEditModal = (): {
  data: TagEditModalStatus;
} & TagEditModalUtils => {
  const [status, setStatus] = useAtom(tagEditModalAtom);

  const open = useCallback(
    (tags: string[], pageId: string, revisionId: string) => {
      setStatus({ isOpen: true, tags, pageId, revisionId });
    },
    [setStatus],
  );

  const close = useCallback(() => {
    setStatus({ isOpen: false, tags: [], pageId: '', revisionId: '' });
  }, [setStatus]);

  return {
    data: status,
    open,
    close,
  };
};
