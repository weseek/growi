import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type Focus = () => void;

export const useFocus = (view?: EditorView): Focus => {

  return useCallback(() => {
    view?.focus?.();
  }, [view]);

};
