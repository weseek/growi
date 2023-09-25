import { EditorView } from '@codemirror/view';
export type InitDoc = (doc?: string) => void;
export declare const useInitDoc: (view?: EditorView) => InitDoc;
