import { useEffect } from 'react';

import { unifiedMergeView } from '@codemirror/merge';

import type { UseCodeMirrorEditor } from '../../services';

export const useUnifiedMergeView = (
    unifiedMergeViewEnabled?: boolean,
    codeMirrorEditor?: UseCodeMirrorEditor,
): void => {

  useEffect(() => {
    if (unifiedMergeViewEnabled == null) {
      return;
    }
    const extension = unifiedMergeViewEnabled ? [
      unifiedMergeView({
        original: codeMirrorEditor?.getDoc() ?? '',
      }),
    ] : [];

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;
  }, [codeMirrorEditor, unifiedMergeViewEnabled]);

};
