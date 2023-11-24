import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertMarkdowElements = (
  prefix: string,
  suffix: string,
) => void;

export const useInsertMarkdownElements = (view?: EditorView): InsertMarkdowElements => {

  return useCallback((prefix, suffix) => {
    const selection = view?.state.sliceDoc(
      view?.state.selection.main.from,
      view?.state.selection.main.to,
    );
    const cursorPos = view?.state.selection.main.head;
    const insertText = view?.state.replaceSelection(prefix + selection + suffix);

    if (insertText == null || cursorPos == null) {
      return;
    }
    view?.dispatch(insertText);
    view?.dispatch({ selection: { anchor: cursorPos + prefix.length } });
    view?.focus();
  }, [view]);
};
