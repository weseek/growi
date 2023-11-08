import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {

  return useCallback((prefix) => {
    if (view == null) {
      return;
    }
    const selection = view.state.sliceDoc(
      view.state.selection.main.from,
      view.state.selection.main.to,
    );

    const cursorPos = view?.state.selection.main.head;
    const space = ' ';
    const insertText = prefix + space;

    if (insertText && cursorPos) {
      view.dispatch({
        changes: {
          from: view.state.selection.main.from,
          to: view.state.selection.main.to,
          insert: insertText + selection,
        },
        selection: { anchor: cursorPos + insertText.length },
      });
    }
    view.focus();
  }, [view]);

};
