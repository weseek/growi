import { useMemo } from 'react';

import { indentWithTab } from '@codemirror/commands';
import { type Extension } from '@codemirror/state';
import { scrollPastEnd, keymap } from '@codemirror/view';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { ReactCodeMirrorProps, UseCodeMirror } from '@uiw/react-codemirror';
import type { SWRResponse } from 'swr';

import type { UseCodeMirrorEditor } from '../services';
import { useCodeMirrorEditor } from '../services';

const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
  keymap.of([indentWithTab]),
];

export const useCodeMirrorEditorMain = (container?: HTMLDivElement | null, props?: ReactCodeMirrorProps): SWRResponse<UseCodeMirrorEditor> => {
  const mergedProps = useMemo<UseCodeMirror>(() => {
    return {
      ...props,
      container,
      extensions: [
        ...(props?.extensions ?? []),
        ...defaultExtensionsMain,
      ],
    };
  }, [container, props]);

  const states = useCodeMirrorEditor(mergedProps);

  return useSWRStatic('codeMirrorEditorMain', props != null ? states : undefined);
};
