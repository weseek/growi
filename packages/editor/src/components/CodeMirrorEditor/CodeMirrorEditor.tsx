import {
  forwardRef, useMemo, useRef, useEffect,
} from 'react';

import { indentUnit } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey } from '../../consts';
import { useFileDropzone } from '../../services';
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
  onUpload?: (files: File[]) => void,
  indentSize?: number,
}

export const CodeMirrorEditor = (props: Props): JSX.Element => {
  const {
    editorKey,
    onChange,
    onUpload,
    indentSize,
  } = props;

  const containerRef = useRef(null);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => {
    return {
      onChange,
    };
  }, [onChange]);
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey, containerRef.current, cmProps);

  useEffect(() => {
    if (indentSize == null) {
      return;
    }
    const extension = indentUnit.of(' '.repeat(indentSize));

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor, indentSize]);

  useEffect(() => {

    const extension = EditorView.domEventHandlers({
      paste(event) {
        event.preventDefault();

        if (onUpload != null && event.clipboardData?.files != null) {
          onUpload(Array.from(event.clipboardData?.files));
        }
        if (event.clipboardData?.getData('text/plain') != null) {
          codeMirrorEditor?.replaceText(event.clipboardData?.getData('text/plain'));
        }
        return true;
      },
      drop(event) {
        // prevents conflicts between codemirror and react-dropzone
        event.preventDefault();
        return true;
      },
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor, onUpload]);

  const { getRootProps, open } = useFileDropzone({ onUpload });

  return (
    <div {...getRootProps()} className="flex-expand-vert">
      <CodeMirrorEditorContainer ref={containerRef} />
      <Toolbar fileOpen={open} />
    </div>
  );

  // const { getRootProps, open } = useDropzoneEditor({ onUpload });

  // return (
  //   <div {...getRootProps()} className="flex-expand-vert">
  //     <CodeMirrorEditorContainer ref={containerRef} />
  //     <Toolbar fileOpen={open} />
  //   </div>
  // );
};
