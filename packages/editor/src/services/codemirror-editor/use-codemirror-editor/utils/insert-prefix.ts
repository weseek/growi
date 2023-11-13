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
    const space = ' ';
    const insertText = noSpaceIfPrefixExists && view.state.doc.lineAt(startPos).text.startsWith(prefix)
      ? prefix
      : prefix + space;

    for (let i = view.state.doc.lineAt(startPos).number; i <= view.state.doc.lineAt(endPos).number; i++) {
      const line = view.state.doc.line(i);

      view.dispatch({
        changes: {
          from: line.from,
          insert: insertText,
        },
        selection: { anchor: line.to + insertText.length },
      });
    }

    view.focus();
  }, [view]);
};
