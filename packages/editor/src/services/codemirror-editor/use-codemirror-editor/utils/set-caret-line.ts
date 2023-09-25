import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type SetCaretLine = (lineNumber?: number) => void;

export const useSetCaretLine = (view?: EditorView): SetCaretLine => {

  return useCallback((lineNumber) => {
    const doc = view?.state.doc;

    if (doc == null) {
      return;
    }

    const posOfLineEnd = doc.line(lineNumber ?? 1).to;
    view?.dispatch({
      selection: {
        anchor: posOfLineEnd,
        head: posOfLineEnd,
      },
    });
    // focus
    view?.focus();
  }, [view]);

};
