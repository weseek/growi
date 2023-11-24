import { useEffect } from 'react';

import type { Extension } from '@codemirror/state';
import { keymap, scrollPastEnd } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey, AcceptedUploadFileType } from '../consts';
import { useCodeMirrorEditorIsolated, useCollaborativeEditorMode } from '../stores';

import { CodeMirrorEditor } from '.';

const additionalExtensions: Extension[] = [
  scrollPastEnd(),
];

type Props = {
  onChange?: (value: string) => void,
  onSave?: () => void,
  onUpload?: (files: File[]) => void,
  acceptedFileType?: AcceptedUploadFileType,
  indentSize?: number,
  userName?: string,
  pageId?: string,
  initialValue?: string,
  onOpenEditor?: (markdown: string) => void,
}

export const CodeMirrorEditorMain = (props: Props): JSX.Element => {
  const {
    onSave, onChange, onUpload, acceptedFileType, indentSize, userName, pageId, initialValue, onOpenEditor,
  } = props;

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  useCollaborativeEditorMode(userName, pageId, initialValue, onOpenEditor, codeMirrorEditor);

  const acceptedFileTypeNoOpt = acceptedFileType ?? AcceptedUploadFileType.NONE;

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
      onChange={onChange}
      onUpload={onUpload}
      acceptedFileType={acceptedFileTypeNoOpt}
      indentSize={indentSize}
    />
  );
};
