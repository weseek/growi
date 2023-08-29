import { useCallback } from 'react';

import { EditorView } from '@codemirror/view';

export type GetDoc = () => string;

export const useGetDoc = (view?: EditorView): GetDoc => {

  const doc = view?.state.doc ?? '';

  return useCallback(() => {
    return doc.toString();
  }, [doc]);

};
