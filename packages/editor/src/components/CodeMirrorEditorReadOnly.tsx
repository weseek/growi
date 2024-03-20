import { useEffect } from 'react';

import { type Extension, EditorState } from '@codemirror/state';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { setDataLine } from '../services/extensions/setDataLine';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor, CodeMirrorEditorProps } from '.';

const additionalExtensions: Extension[] = [
  [
    setDataLine,
    EditorState.readOnly.of(true),
  ],
];

type Props = CodeMirrorEditorProps & {
  body?: string,
}

export const CodeMirrorEditorReadOnly = (props: Props): JSX.Element => {
  const { body, ...otherProps } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.READONLY);

  codeMirrorEditor?.initDoc(body);

  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  return (
    <CodeMirrorEditor
      hideToolbar
      editorKey={GlobalCodeMirrorEditorKey.READONLY}
      {...otherProps}
    />
  );
};
