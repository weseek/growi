import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type HandsonTableModalSaveHandler = () => void;

type HandsontableModalStatus = {
  isOpened: boolean,
  editor: any,
  // onSave is passed only when editing table directly from the page.
  onSave?: HandsonTableModalSaveHandler
}

type HandsontableModalStatusUtils = {
  open(
    editor: any,
    onSave?: HandsonTableModalSaveHandler
  ): void
  close(): void
}

export const useHandsontableModal = (status?: HandsontableModalStatus): SWRResponse<HandsontableModalStatus, Error> & HandsontableModalStatusUtils => {
  const initialData: HandsontableModalStatus = {
    isOpened: false,
    editor: undefined,
  };

  const swrResponse = useSWRStatic<HandsontableModalStatus, Error>('handsontableModalStatus', status, { fallbackData: initialData });

  const { mutate } = swrResponse;

  const open = useCallback((editor: any, onSave?: HandsonTableModalSaveHandler): void => {
    mutate({
      isOpened: true, editor, onSave,
    });
  }, [mutate]);
  const close = useCallback((): void => {
    mutate({
      isOpened: false, editor: undefined, onSave: undefined,
    });
  }, [mutate]);

  return {
    ...swrResponse,
    open,
    close,
  };
};
