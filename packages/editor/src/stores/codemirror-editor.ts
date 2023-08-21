import { useMemo } from 'react';

import { type Extension } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';
import {
  type SWRResponseWithUtils, withUtils,
} from '@growi/core/dist/swr';

import type { UseCodeMirrorEditor, UseCodeMirrorEditorResponse } from '../services';
import { useCodeMirrorEditor } from '../services';

import { useStaticSWR } from './use-static-swr';

const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
];

type MainEditorUtils = {
  // impl something
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

  const swrResponse = useStaticSWR('codeMirrorEditorMain', container != null ? states : undefined);

  return withUtils(swrResponse, {
    // impl something
  });
};
