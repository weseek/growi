import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type ScrollIntoView = (line: number) => void;

export const useScrollIntoView = (view?: EditorView): ScrollIntoView => {

  return useCallback((line) => {
    view?.dispatch({
      effects: EditorView.scrollIntoView(line),
    });
  }, [view]);

};
