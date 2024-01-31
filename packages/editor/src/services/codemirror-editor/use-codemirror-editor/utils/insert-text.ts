import { useCallback } from 'react';

import { type EditorView } from '@codemirror/view';

export type InsertText = (text: string, from?: number, to?: number) => void;


export const useInsertText = (view?: EditorView): InsertText => {
  return useCallback((text, from?, to?) => {
    if (view == null) {
      return;
    }
    const insertPos = view.state.selection.main.head;

    const fromPos = from ?? insertPos;
    const toPos = to ?? insertPos;

    view.dispatch({
      changes: {
        from: fromPos,
        to: toPos,
        insert: text,
      },
      selection: { anchor: insertPos },
    });
  }, [view]);

};
