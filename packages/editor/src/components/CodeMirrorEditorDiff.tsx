import { useEffect } from 'react';

import type { Extension } from '@codemirror/state';
import { placeholder } from '@codemirror/view';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import { CodeMirrorEditor } from '.';


const additionalExtensions: Extension[] = [
  [
    // todo: i18n
    placeholder('Please select page body'),
  ],
];

export const CodeMirrorEditorDiff = (): JSX.Element => {
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.DIFF);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  return (
    <CodeMirrorEditor
      editorKey={GlobalCodeMirrorEditorKey.DIFF}
      hideToolbar
    />
  );
};
