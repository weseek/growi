import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string, flag: boolean) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {

  return useCallback((prefix: string, isContinuous: boolean) => {
    if (view == null) {
      return;
    }

    const cursorPos = view.state.selection.main.head;
    const space = ' ';
    const line = view.state.doc.lineAt(cursorPos);
    const insertText = isContinuous && line.text.startsWith(prefix) ? prefix : prefix + space;

    view.dispatch({
      changes: {
        from: line.from,
        to: line.from,
        insert: insertText,
      },
      selection: { anchor: line.from + line.text.length + insertText.length },
    });
    view.focus();
  }, [view]);

};
