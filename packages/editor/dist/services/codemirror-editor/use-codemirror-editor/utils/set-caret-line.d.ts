import { EditorView } from '@codemirror/view';
export type SetCaretLine = (lineNumber?: number) => void;
export declare const useSetCaretLine: (view?: EditorView) => SetCaretLine;
