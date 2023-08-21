import { useMemo } from 'react';

import { EditorState, type Extension } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';
import {
  type SWRResponseWithUtils, withUtils,
} from '@growi/core/dist/swr';

import type { UseCodeMirrorEditor, UseCodeMirrorEditorStates } from '../services';
import { defaultExtensionsToInit, useCodeMirrorEditor } from '../services';

import { useStaticSWR } from './use-static-swr';

const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
];

const defaultExtensionsToInitMain: Extension[] = [
  ...defaultExtensionsToInit,
  ...defaultExtensionsMain,
];

type OperationUtils = {
  initDoc: (doc?: string) => void,
}

export const useCodeMirrorEditorMain = (container?: HTMLDivElement | null): SWRResponseWithUtils<OperationUtils, UseCodeMirrorEditorStates> => {
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
    initDoc: (doc) => {
      const currentView = swrResponse.data?.view;
      if (currentView == null) {
        return;
      }

      // create a new state
      const newState = EditorState.create({
        doc,
        extensions: defaultExtensionsToInitMain,
      });

      currentView.setState(newState);
    },
  });
};
