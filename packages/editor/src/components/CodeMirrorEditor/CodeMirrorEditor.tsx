import {
  forwardRef, useMemo, useRef, useEffect,
} from 'react';


import { defaultKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey } from '../../consts';
import { useCodeMirrorEditorIsolated } from '../../stores';

import { Toolbar } from './Toolbar';

import style from './CodeMirrorEditor.module.scss';

const CodeMirrorEditorContainer = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div {...props} className={`flex-expand-vert ${style['codemirror-editor-container']}`} ref={ref} />
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
    onChange,
    onSave,
  } = props;

  const containerRef = useRef(null);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => {
    return {
      onChange,
    };
  }, [onChange]);

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey, containerRef.current, cmProps);

  // set handler to save with ctrl/cmd + Enter key
  useEffect(() => {
    if (onSave == null) {
      return;
    }

    const extension = keymap.of([
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
      ...defaultKeymap,
    ]);

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor, onSave]);

  return (
    <div className="flex-expand-vert">
      <CodeMirrorEditorContainer ref={containerRef} />
      <Toolbar />
    </div>
  );
};
