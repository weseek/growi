import { useEffect } from 'react';

import { type Extension, EditorState } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { setDataLine } from '../services/extensions/setDataLine';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor, CodeMirrorEditorProps } from '.';

const additionalExtensions: Extension[] = [
  [
    scrollPastEnd(),
    setDataLine,
    EditorState.readOnly.of(true),
  ],
] as const;

type Props = CodeMirrorEditorProps & {
  body?: string,
}

export const CodeMirrorEditorReadOnly = (props: Props): JSX.Element => {
  const { body, ...otherProps } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  codeMirrorEditor?.initDoc(body);

  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      {...otherProps}
    />
  );
};
