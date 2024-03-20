import { useEffect } from 'react';

import { type Extension, EditorState } from '@codemirror/state';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { setDataLine } from '../services/extensions/setDataLine';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';

const additionalExtensions: Extension[] = [
  [
    setDataLine,
    EditorState.readOnly.of(true),
  ],
];

type Props = {
  markdown?: string,
  onScroll?: () => void,
}

export const CodeMirrorEditorReadOnly = ({ markdown, onScroll }: Props): JSX.Element => {
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.READONLY);

  codeMirrorEditor?.initDoc(markdown);

  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  return (
    <CodeMirrorEditor
      hideToolbar
      editorKey={GlobalCodeMirrorEditorKey.READONLY}
      onScroll={onScroll}
    />
  );
};
