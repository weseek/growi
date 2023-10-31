import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';


export type InsertMarkdownText = (
  prefix: string,
  suffix: string,
) => void;

export const useInsertMarkdownText = (view?: EditorView): InsertMarkdownText => {

  return useCallback((prefix, suffix) => {
    const selection = view?.state.sliceDoc(
      view?.state.selection.main.from,
      view?.state.selection.main.to,
    );
    const cursorPos = view?.state.selection.main.head;
    let curPosAfterReplacing = {};
    const insertText = view?.state.replaceSelection(prefix + selection + suffix);

    if (insertText) {
      view?.dispatch(insertText);
      if (cursorPos) {
        curPosAfterReplacing = cursorPos + prefix.length;
      }
      view?.dispatch({ selection: { anchor: curPosAfterReplacing as number } });
      view?.focus();
    }
  }, [view]);
};
