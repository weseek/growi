import { atom, useAtom } from 'jotai';

import { EditorMode } from '~/stores-universal/ui';

import type { UseAtom } from './helper';

export const editorModeAtom = atom<EditorMode>(EditorMode.View);

// TODO: migrate from SWR version
// see: ~/stores-universal/ui
export const useEditorMode = (): UseAtom<typeof editorModeAtom> => {
  return useAtom(editorModeAtom);
};
