import { useCallback } from 'react';

import type { EditorView } from '@codemirror/view';

export type GetDoc = () => string;

export const useGetDoc = (view?: EditorView): GetDoc => {

  return useCallback(() => {
    return view?.state.doc.toString() ?? '';
  }, [view]);

};
