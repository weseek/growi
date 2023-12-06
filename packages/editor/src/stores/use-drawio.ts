import { useCallback } from 'react';

import type { EditorView } from '@codemirror/view';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type DrawioModalSaveHandler = () => void;

type DrawioModalStatus = {
  isOpened: boolean,
  editor?: EditorView,
  onSave?: DrawioModalSaveHandler,
}

type DrawioModalStatusUtils = {
  open(
    editor?: EditorView,
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

  const open = useCallback((editor?: EditorView, onSave?: DrawioModalSaveHandler): void => {
    mutate({ isOpened: true, editor, onSave });
  }, [mutate]);

  const close = useCallback((): void => {
    mutate({ isOpened: false, editor: undefined, onSave: undefined });
  }, [mutate]);

  return {
    ...swrResponse,
    open,
    close,
  };
};
