import { useCallback, useMemo } from 'react';

import { type Extension } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';
import {
  type SWRResponseWithUtils, withUtils, useSWRStatic,
} from '@growi/core/dist/swr';

import type { UseCodeMirrorEditor, UseCodeMirrorEditorResponse } from '../services';
import { useCodeMirrorEditor } from '../services';

const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
];

type MainEditorUtils = {
  // impl something
  setIndentSize: (indentSize?: number) => void,
};

export const useCodeMirrorEditorMain = (container?: HTMLDivElement | null): SWRResponseWithUtils<MainEditorUtils, UseCodeMirrorEditorResponse> => {
  const props = useMemo<UseCodeMirrorEditor>(() => {
    return {
      container,
      autoFocus: true,
      extensions: defaultExtensionsMain,
    };
  }, [container]);

  const states = useCodeMirrorEditor(props);

  const swrResponse = useSWRStatic('codeMirrorEditorMain', container != null ? states : undefined);

  // implement setIndentSize method
  const setIndentSize = useCallback((indentSize?: number): void => {

  }, []);

  return withUtils(swrResponse, {
    // impl something
    setIndentSize,
  });
};
