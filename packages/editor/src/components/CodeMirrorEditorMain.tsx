import { useEffect } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';


const defaultExtensions: Extension[] = [
  scrollPastEnd(),
];


type Props = {
  onChange?: (value: string) => void,
  onSave?: () => void,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    onSave, onChange,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  // set handler to save with shortcut key
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(defaultExtensions);
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
      onChange={onChange}
    />
  );
};
