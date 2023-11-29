import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type DrawioModalSaveHandler = () => void;

type DrawioModalStatus = {
  isOpened: boolean,
  onSave?: DrawioModalSaveHandler,
}

type DrawioModalStatusUtils = {
  open(
    onSave?: DrawioModalSaveHandler,
  ): void,
  close(): void,
}

export const useDrawioModalForEditor = (status?: DrawioModalStatus): SWRResponse<DrawioModalStatus, Error> & DrawioModalStatusUtils => {
  const initialData: DrawioModalStatus = {
    isOpened: false,
  };
  const swrResponse = useSWRStatic<DrawioModalStatus, Error>('drawioModalStatus', status, { fallbackData: initialData });

  const { mutate } = swrResponse;

  const open = useCallback((onSave?: DrawioModalSaveHandler): void => {
    mutate({ isOpened: true, onSave });
  }, [mutate]);

  const close = useCallback((): void => {
    mutate({ isOpened: false, drawioMxFile: '', onSave: undefined });
  }, [mutate]);

  return {
    ...swrResponse,
    open,
    close,
  };
};
