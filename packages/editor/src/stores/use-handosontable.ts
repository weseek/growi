import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type HandsonTableModalSaveHandler = () => void;

type HandsontableModalStatus = {
  isOpened: boolean,
  onSave?: HandsonTableModalSaveHandler
}

type HandsontableModalStatusUtils = {
  open(
    onSave?: HandsonTableModalSaveHandler
  ): void
  close(): void
}

export const useHandsontableModal = (status?: HandsontableModalStatus): SWRResponse<HandsontableModalStatus, Error> & HandsontableModalStatusUtils => {
  const initialData: HandsontableModalStatus = {
    isOpened: false,
  };

  const swrResponse = useSWRStatic<HandsontableModalStatus, Error>('handsontableModalStatus', status, { fallbackData: initialData });

  const { mutate } = swrResponse;

  const open = useCallback((onSave?: HandsonTableModalSaveHandler): void => {
    mutate({
      isOpened: true, onSave,
    });
  }, [mutate]);
  const close = useCallback((): void => {
    mutate({
      isOpened: false, onSave: undefined,
    });
  }, [mutate]);

  return {
    ...swrResponse,
    open,
    close,
  };
};
