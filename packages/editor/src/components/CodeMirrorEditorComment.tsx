import { useEffect } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor, CodeMirrorEditorProps } from '.';


const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];


type Props = CodeMirrorEditorProps & {
  commentId?: string,
}

export const CodeMirrorEditorComment = (props: Props): JSX.Element => {
  const {
    commentId,
    onSave, ...rest
  } = props;

  const key = commentId ?? GlobalCodeMirrorEditorKey.COMMENT_NEW;
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(key);

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
      editorKey={key}
      onSave={onSave}
      {...rest}
    />
  );
};
