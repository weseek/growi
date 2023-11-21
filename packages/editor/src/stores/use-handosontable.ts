import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

type HandsonTableModalSaveHandler = () => void;

type HandsontableModalStatus = {
  isOpened: boolean,
  editor?: EditorView,
  onSave?: HandsonTableModalSaveHandler
}

type HandsontableModalStatusUtils = {
  open(
    editor?: EditorView, onSave?: HandsonTableModalSaveHandler
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

  const open = useCallback((editor?: EditorView, onSave?: HandsonTableModalSaveHandler): void => {
    console.log('useHandsontableModalで受け取ったeditor:', editor);
    mutate({
      isOpened: true, editor, onSave,
    });
    console.log('modal22', editor);
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
