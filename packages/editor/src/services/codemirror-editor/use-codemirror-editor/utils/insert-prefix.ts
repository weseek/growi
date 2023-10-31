import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {

  return useCallback((prefix) => {
    const selection = view?.state.sliceDoc(
      view?.state.selection.main.from,
      view?.state.selection.main.to,
    );
    const insertText = view?.state.replaceSelection(prefix + selection);

    if (insertText) {
      view?.dispatch(insertText);
      view?.focus();
    }
  }, [view]);

};
