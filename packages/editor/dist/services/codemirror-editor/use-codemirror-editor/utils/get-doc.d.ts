import { EditorView } from '@codemirror/view';
export type GetDoc = () => string;
export declare const useGetDoc: (view?: EditorView) => GetDoc;
