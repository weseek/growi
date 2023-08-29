import { useMemo } from 'react';

import { type Extension } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';
import {
  type SWRResponseWithUtils, withUtils, useSWRStatic,
} from '@growi/core/dist/swr';
import type { UseCodeMirror } from '@uiw/react-codemirror';

import type { UseCodeMirrorEditor } from '../services';
import { useCodeMirrorEditor } from '../services';

const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
];

type MainEditorUtils = {
  // impl something
};

export const useCodeMirrorEditorMain = (container?: HTMLDivElement | null): SWRResponseWithUtils<MainEditorUtils, UseCodeMirrorEditor> => {
  const props = useMemo<UseCodeMirror>(() => {
    return {
      container,
      autoFocus: true,
      extensions: defaultExtensionsMain,
    };
  }, [container]);

  const states = useCodeMirrorEditor(props);

  const swrResponse = useSWRStatic('codeMirrorEditorMain', container != null ? states : undefined);

  return withUtils(swrResponse, {
    // impl something
  });
};
