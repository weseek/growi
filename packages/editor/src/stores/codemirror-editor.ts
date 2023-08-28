import { useCallback, useMemo, useState } from 'react';

import { indentUnit } from '@codemirror/language';
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

  const [indentUnitString, setIndentUnitString] = useState<string>('  ');
  const extentsionsMain: Extension[] = useMemo(() => [
    indentUnit.of(indentUnitString),
  ],
  [indentUnitString]);

  const props = useMemo<UseCodeMirrorEditor>(() => {
    return {
      container,
      autoFocus: true,
      extensions: [
        ...defaultExtensionsMain,
        ...extentsionsMain,
      ],
    };
  }, [container, extentsionsMain]);

  const states = useCodeMirrorEditor(props);

  const swrResponse = useSWRStatic('codeMirrorEditorMain', container != null ? states : undefined);

  // implement setIndentSize method
  const setIndentSize = useCallback((indentSize?: number): void => {
    if (indentSize != null) {
      setIndentUnitString(' '.repeat(indentSize));
    }
  }, [setIndentUnitString]);

  return withUtils(swrResponse, {
    // impl something
    setIndentSize,
  });
};
