import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

type InsertHeader = (view?: EditorView) => void;

export const useInsertHeader = (): InsertHeader => {
  return useCallback((view?: EditorView) => {
    if (view == null) {
      return;
    }
    let prefix = '#';
    const cursorPos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(cursorPos);
    const insertPos = line.text.startsWith(prefix) ? cursorPos - 1 : cursorPos;

    if (!line.text.startsWith(prefix)) {
      prefix += ' ';
    }

    view.dispatch({
      changes: {
        from: insertPos,
        to: insertPos,
        insert: prefix,
      },
      selection: { anchor: cursorPos + prefix.length },
    });
    view.focus();
  }, []);
};
