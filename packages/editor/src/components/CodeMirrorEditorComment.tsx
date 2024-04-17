import { memo, useEffect } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor, CodeMirrorEditorProps } from '.';


const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];


export const CodeMirrorEditorComment = memo((props: CodeMirrorEditorProps): JSX.Element => {
  const {
    editorKey,
    onSave, ...rest
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to comment with ctrl/cmd + Enter key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const keymapExtension = keymap.of([
      {
        key: 'Mod-Enter',
        preventDefault: true,
        run: () => {
          const doc = codeMirrorEditor?.getDoc();
          if (doc != null) {
            onSave();
          }
          return true;
        },
      },
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(keymapExtension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  return (
    <CodeMirrorEditor
      editorKey={editorKey}
      onSave={onSave}
      {...rest}
    />
  );
});
