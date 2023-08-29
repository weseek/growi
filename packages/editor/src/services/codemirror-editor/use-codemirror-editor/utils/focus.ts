import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type Focus = () => void;

export const useFocus = (view?: EditorView): Focus => {

  return useCallback(() => {
    view?.focus?.();
    // compromise to put the view into deps
    //   in order to ignore "TypeError: this is undefined" caused by invoking focus()
  }, [view]);

};
