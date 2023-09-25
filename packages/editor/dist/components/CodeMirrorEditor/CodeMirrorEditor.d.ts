import { GlobalCodeMirrorEditorKey } from '../../consts';
type Props = {
    editorKey: string | GlobalCodeMirrorEditorKey;
    onChange?: (value: string) => void;
    indentSize?: number;
};
export declare const CodeMirrorEditor: (props: Props) => JSX.Element;
export {};
