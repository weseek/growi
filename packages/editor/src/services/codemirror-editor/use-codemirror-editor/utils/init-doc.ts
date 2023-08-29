import { useCallback } from 'react';

import { Transaction } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export type InitDoc = (doc?: string) => void;

export const useInitDoc = (view?: EditorView): InitDoc => {

  const { dispatch } = view ?? {};
  const docLength = view?.state.doc.length;

  return useCallback((doc) => {
    dispatch?.({
      changes: {
        from: 0,
        to: docLength,
        insert: doc,
      },
      annotations: Transaction.addToHistory.of(false),
    });
  }, [docLength, dispatch]);

};
