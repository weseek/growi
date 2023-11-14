import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertPrefix = (prefix: string, noSpaceIfPrefixExists?: boolean) => void;

export const useInsertPrefix = (view?: EditorView): InsertPrefix => {
  return useCallback((prefix: string, noSpaceIfPrefixExists = false) => {
    if (view == null) {
      return;
    }
    const startPos = view.state.selection.main.from;
    const endPos = view.state.selection.main.to;
    const lines = [];

    for (let i = view.state.doc.lineAt(startPos).number; i < view.state.doc.lineAt(endPos).number + 1; i++) {
      const line = view.state.doc.line(i);
      const space = ' ';
      const insertText = noSpaceIfPrefixExists && line.text.startsWith(prefix)
        ? prefix
        : prefix + space;
      lines.push({ from: line.from, insert: insertText });
    }
    view.dispatch({ changes: lines });
    // get view state after insert
    const getEndLine = view.state.doc.lineAt(view.state.selection.main.to);
    view.dispatch({ selection: { anchor: getEndLine.from + getEndLine.text.length } });
    view.focus();
  }, [view]);
};
