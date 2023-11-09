import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string, noSpaceIfPrefixExists?: boolean) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {

  return useCallback((prefix: string, noSpaceIfPrefixExists = false) => {
    if (view == null) {
      return;
    }

    const cursorPos = view.state.selection.main.from;
    const space = ' ';
    const line = view.state.doc.lineAt(cursorPos);
    const insertText = noSpaceIfPrefixExists && line.text.startsWith(prefix) ? prefix : prefix + space;

    view.dispatch({
      changes: {
        from: line.from,
        insert: insertText,
      },
      selection: { anchor: line.to + insertText.length },
    });
    view.focus();
  }, [view]);

};
