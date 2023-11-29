import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string, noSpaceIfPrefixExists?: boolean) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {
  return useCallback((prefix: string, noSpaceIfPrefixExists = false) => {
    if (view == null) {
      return;
    }

    // get the line numbers of the selected range
    const { from, to } = view.state.selection.main;
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);

    // Insert prefix for each line
    const lines = [];
    let insertTextLength = 0;
    for (let i = startLine.number; i <= endLine.number; i++) {
      const line = view.state.doc.line(i);
      const insertText = noSpaceIfPrefixExists && line.text.startsWith(prefix)
        ? prefix
        : `${prefix} `;
      insertTextLength += insertText.length;
      lines.push({ from: line.from, insert: insertText });
    }
    view.dispatch({ changes: lines });

    // move the cursor to the end of the selected line
    view.dispatch({ selection: { anchor: endLine.to + insertTextLength } });
    view.focus();
  }, [view]);
};
