import { useCallback } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type DrawioModalSaveHandler = () => void;

type DrawioModalStatus = {
  isOpened: boolean,
  editorKey: string,
  onSave?: DrawioModalSaveHandler,
}

type DrawioModalStatusUtils = {
  open(
    editorKey: string,
    onSave?: DrawioModalSaveHandler,
  ): void,
  close(): void,
}

export const useDrawioModalForEditor = (status?: DrawioModalStatus): SWRResponse<DrawioModalStatus, Error> & DrawioModalStatusUtils => {
  const initialData: DrawioModalStatus = {
    isOpened: false,
    editorKey: '',
  };
  const swrResponse = useSWRStatic<DrawioModalStatus, Error>('drawioModalStatus', status, { fallbackData: initialData });

  const { mutate } = swrResponse;

  const open = useCallback((editorKey: string, onSave?: DrawioModalSaveHandler): void => {
    mutate({ isOpened: true, editorKey, onSave });
  }, [mutate]);

  const close = useCallback((): void => {
    mutate({ isOpened: false, editorKey: '', onSave: undefined });
  }, [mutate]);

  return {
    ...swrResponse,
    open,
    close,
  };
};
