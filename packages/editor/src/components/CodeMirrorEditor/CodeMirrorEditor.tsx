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
      paste(event, view) {
        event.preventDefault();
        console.log('codemirror: ', event.clipboardData?.getData('text/plain'));
        console.log('codemirror: ', event.clipboardData?.files);
        console.log('codemirror: ', event.clipboardData?.items);
        return false;
      },
      drag(event, view) {
        event.preventDefault();
        console.log('DRAG: ', event.dataTransfer);
        return true;
      },
      dragenter(event, view) {
        event.preventDefault();
        console.log('DRAGENER: ', event.dataTransfer);
        return true;
      },
      dragover(event, view) {
        event.preventDefault();
        console.log('DRAGOVER: ', event.dataTransfer);
        return true;
      },
      drop(event, view) {
        event.preventDefault();
        console.log('DROP: ', event.dataTransfer);
        return true;
      },
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions?.(extension);
    return cleanupFunction;

  }, [codeMirrorEditor]);

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
