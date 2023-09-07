import { GlobalCodeMirrorEditorKey } from '../../consts';
type Props = {
    editorKey: string | GlobalCodeMirrorEditorKey;
    onChange?: (value: string) => void;
};
export declare const CodeMirrorEditor: (props: Props) => JSX.Element;
export {};
