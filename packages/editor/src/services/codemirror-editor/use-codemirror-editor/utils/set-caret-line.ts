import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type SetCaretLine = (lineNumber?: number) => void;

export const useSetCaretLine = (view?: EditorView): SetCaretLine => {

  const dispatch = view?.dispatch;
  const doc = view?.state.doc;

  return useCallback((lineNumber) => {
    if (dispatch == null || doc == null) {
      return;
    }

    const posOfLineEnd = doc.line(lineNumber ?? 1).to;
    dispatch({
      selection: {
        anchor: posOfLineEnd,
        head: posOfLineEnd,
      },
    });
    // focus
    view?.focus();

    // compromise to put the view into deps
    //   in order to ignore "TypeError: this is undefined" caused by invoking focus()
  }, [dispatch, doc, view]);

};
