import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string, flag: boolean) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {

  return useCallback((prefix: string, isContinuous: boolean) => {
    if (view == null) {
      return;
    }
    const selection = view.state.sliceDoc(
      view.state.selection.main.from,
      view.state.selection.main.to,
    );

    const cursorPos = view.state.selection.main.head;
    const space = ' ';
    const line = view.state.doc.lineAt(cursorPos);
    const insertText = isContinuous && line.text.startsWith(prefix) ? prefix : prefix + space;
    const insertPos = isContinuous && line.text.startsWith(prefix) ? cursorPos - 1 : cursorPos;
    const afterInsertPos = cursorPos + insertText.length + selection.length;

    view.dispatch({
      changes: {
        from: insertPos,
        to: insertPos,
        insert: insertText,
      },
      selection: { anchor: afterInsertPos, head: afterInsertPos - selection.length },
    });
    view.focus();
  }, [view]);

};
