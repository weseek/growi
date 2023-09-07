import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { type UseCodeMirror } from '@uiw/react-codemirror';
import { type AppendExtensions } from './utils/append-extensions';
import { type Focus } from './utils/focus';
import { type GetDoc } from './utils/get-doc';
import { type InitDoc } from './utils/init-doc';
import { type SetCaretLine } from './utils/set-caret-line';
type UseCodeMirrorEditorUtils = {
    initDoc: InitDoc;
    appendExtensions: AppendExtensions;
    getDoc: GetDoc;
    focus: Focus;
    setCaretLine: SetCaretLine;
};
export type UseCodeMirrorEditor = {
    state: EditorState | undefined;
    view: EditorView | undefined;
} & UseCodeMirrorEditorUtils;
export declare const useCodeMirrorEditor: (props?: UseCodeMirror) => UseCodeMirrorEditor;
export {};
