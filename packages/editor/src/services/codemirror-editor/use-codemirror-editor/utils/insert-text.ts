import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertText = (text: string, from?: number, to?: number) => void;


export const useInsertText = (view: EditorView): InsertText => {
  const insertPos = view.state.selection.main.head;

  return useCallback((text, from = insertPos, to = insertPos) => {

    view.dispatch({
      changes: {
        from,
        to,
        insert: text,
      },
      selection: { anchor: from },
    });
  }, [insertPos, view]);

};
