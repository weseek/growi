import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
type CleanupFunctions = () => void;
export type AppendExtensions = (extensions: Extension | Extension[]) => CleanupFunctions | undefined;
export declare const useAppendExtensions: (view?: EditorView) => AppendExtensions;
export {};
