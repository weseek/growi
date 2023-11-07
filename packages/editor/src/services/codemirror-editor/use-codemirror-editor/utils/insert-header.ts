import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertHeader = (prefix: string) => void;

export const useInsertHeader = (view?: EditorView): InsertHeader => {

  return useCallback((prefix) => {

    if (view == null) {
      return;
    }

    const selection = view?.state.sliceDoc(
      view.state.selection.main.from,
      view.state.selection.main.to,
    );

    const cursorPos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(cursorPos);
    const insertPos = line.text.startsWith(prefix) ? cursorPos - 1 : cursorPos;
    let insertText = prefix;

    if (!line.text.startsWith(prefix)) {
      insertText += ' ';
    }

    view.dispatch({
      changes: {
        from: insertPos,
        to: insertPos,
        insert: insertText + selection,
      },
      selection: { anchor: cursorPos + insertText.length },
    });
    view.focus();
  }, [view]);
};
