import type { Extension } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';
import type { SWRResponse } from 'swr';


import type { UseCodeMirrorEditorStates } from '../services';
import { useCodeMirrorEditor } from '../services';

import { useStaticSWR } from './use-static-swr';

export const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
];

export const useCodeMirrorEditorMain = (container?: HTMLDivElement | null): SWRResponse<UseCodeMirrorEditorStates> => {
  const states = useCodeMirrorEditor({
    container,
    autoFocus: true,
    extensions: [
      scrollPastEnd(),
    ],
  });
  return useStaticSWR('codeMirrorEditorMain', container != null ? states : undefined);
};
