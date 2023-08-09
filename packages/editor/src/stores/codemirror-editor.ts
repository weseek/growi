import type { SWRResponse } from 'swr';


import type { UseCodeMirrorEditor, UseCodeMirrorEditorStates } from '../services';
import { useCodeMirrorEditor } from '../services';

import { useStaticSWR } from './use-static-swr';

export const useCodeMirrorEditorMain = (props?: UseCodeMirrorEditor): SWRResponse<UseCodeMirrorEditorStates> => {
  const states = useCodeMirrorEditor(props);
  return useStaticSWR('codeMirrorEditorMain', props != null ? states : undefined);
};
