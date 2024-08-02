import { useEffect } from 'react';

import { type Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../../consts';
import { CodeMirrorEditor, type CodeMirrorEditorProps } from '../components-internal/CodeMirrorEditor';
import { setDataLine } from '../services-internal';
import { useCodeMirrorEditorIsolated } from '../stores/codemirror-editor';

const additionalExtensions: Extension[] = [
  [
    scrollPastEnd(),
    setDataLine,
  ],
];
export const CodeMirrorEditorMain = (props: CodeMirrorEditorProps): JSX.Element => {
  const { onSave, ...otherProps } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // set handler to save with shortcut key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const extension = keymap.of([
      {
        key: 'Mod-s',
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

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.MAIN}
      onSave={onSave}
      {...otherProps}
    />
  );
};
