import { atom, useAtom } from 'jotai';

import { EditorMode } from '~/stores-universal/ui';

export const editorModeAtom = atom<EditorMode>(EditorMode.View);

export const useEditorModeState = () => {
  return useAtom(editorModeAtom);
};
