import {
  forwardRef, useEffect, useMemo, useRef,
} from 'react';

import { keymap } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey } from '../consts';
import { useCodeMirrorEditorIsolated } from '../stores';

import style from './CodeMirrorEditor.module.scss';

const CodeMirrorEditorContainer = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div {...props} className={`${style['codemirror-editor-container']}`} ref={ref} />
  );
});


type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  onChange?: (value: string) => void,
  onSave?: () => void,
}

export const CodeMirrorEditor = (props: Props): JSX.Element => {
  const {
    editorKey,
    onSave, onChange,
  } = props;

  const containerRef = useRef(null);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => {
    return {
      onChange,
    };
  }, [onChange]);
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey, containerRef.current, cmProps);

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

    const cleanupFunction = codeMirrorEditor?.appendExtension?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  return <CodeMirrorEditorContainer ref={containerRef} />;
};
