import { useEffect, useRef, useMemo } from 'react';

import type { Extension } from '@codemirror/state';
import { placeholder, scrollPastEnd } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey } from '../../../consts';
import { useCodeMirrorEditorIsolated } from '../../stores/codemirror-editor';
import { useDefaultExtensions } from '../../stores/use-default-extensions';
import { useEditorSettings } from '../../stores/use-editor-settings';

const additionalExtensions: Extension[] = [
  [
    // todo: i18n
    placeholder('Please select page body'),
    scrollPastEnd(),
  ],
];

export const CodeMirrorEditorDiff = (): React.ReactElement => {
  const codeMirrorRef = useRef(null);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => {
    return {};
  }, []);

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.DIFF, codeMirrorRef.current, cmProps);

  useDefaultExtensions(codeMirrorEditor);
  useEditorSettings(codeMirrorEditor);

  // setup additional extensions
  useEffect(() => {
    return codeMirrorEditor?.appendExtensions?.(additionalExtensions);
  }, [codeMirrorEditor]);

  return (
    <div ref={codeMirrorRef} />
  );
};
