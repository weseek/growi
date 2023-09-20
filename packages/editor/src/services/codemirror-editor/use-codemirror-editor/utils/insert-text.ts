import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type InsertText = (text: string) => void;

export const useInsertText = (view?: EditorView): InsertText => {

  return useCallback((text) => {
    view?.dispatch(
      view?.state.update(
        view?.state.replaceSelection(text),
      ),
    );
  }, [view]);

};
