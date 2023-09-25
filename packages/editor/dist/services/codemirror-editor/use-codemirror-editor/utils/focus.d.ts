import { EditorView } from '@codemirror/view';
export type Focus = () => void;
export declare const useFocus: (view?: EditorView) => Focus;
