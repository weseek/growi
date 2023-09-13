import { useEffect } from 'react';


import { defaultKeymap } from '@codemirror/commands';
import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';


const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];


type Props = {
  onChange?: (value: string) => void,
  onComment?: () => void,
}

export const CodeMirrorEditorComment = (props: Props): JSX.Element => {
  const {
    onComment, onChange,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.COMMENT);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  // setup comment keymap
  useEffect(() => {
    if (onComment == null) {
      return;
    }

    const keymapExtension = keymap.of([
      {
        // set handler to comment with ctrl/cmd + Enter key
        key: 'Mod-Enter',
        preventDefault: true,
        run: () => {
          const doc = codeMirrorEditor?.getDoc();
          if (doc != null) {
            onComment();
          }
          return true;
        },
      },
      ...defaultKeymap,
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(keymapExtension);

    return cleanupFunction;
  }, [codeMirrorEditor, onComment]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.COMMENT}
      onChange={onChange}
    />
  );
};
