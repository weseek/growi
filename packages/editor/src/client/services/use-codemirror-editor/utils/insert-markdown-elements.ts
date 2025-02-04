import { useCallback } from 'react';

import type { EditorView } from '@codemirror/view';

export type InsertMarkdownElements = (
  prefix: string,
  suffix: string,
) => void;

const removeSymbol = (text: string, prefix: string, suffix: string): string => {
  let result = text;

  if (result.startsWith(prefix)) {
    result = result.slice(prefix.length);
  }

  if (result.endsWith(suffix)) {
    result = result.slice(0, -suffix.length);
  }

  return result;
};

export const useInsertMarkdownElements = (view?: EditorView): InsertMarkdownElements => {

  return useCallback((prefix, suffix) => {
    const selection = view?.state.sliceDoc(
      view?.state.selection.main.from,
      view?.state.selection.main.to,
    );
    const cursorPos = view?.state.selection.main.head;

    let insertText;

    if (selection?.startsWith(prefix) && selection?.endsWith(suffix)) {
      const result = removeSymbol(selection, prefix, suffix);
      insertText = view?.state.replaceSelection(result);
    }
    else {
      insertText = view?.state.replaceSelection(prefix + selection + suffix);
    }

    if (insertText == null || cursorPos == null) {
      return;
    }
    view?.dispatch(insertText);
    view?.dispatch({ selection: { anchor: cursorPos + prefix.length } });
    view?.focus();
  }, [view]);
};
