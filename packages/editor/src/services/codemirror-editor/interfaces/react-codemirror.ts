import type { EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

export type UseCodeMirrorEditorStates = {
  state: EditorState | undefined;
  setState: import('react').Dispatch<import('react').SetStateAction<EditorState | undefined>>;
  view: EditorView | undefined;
  setView: import('react').Dispatch<import('react').SetStateAction<EditorView | undefined>>;
  container: HTMLDivElement | undefined;
  setContainer: import('react').Dispatch<import('react').SetStateAction<HTMLDivElement | undefined>>;
}
