import {
  forwardRef, useMemo, useRef, useEffect, useCallback,
} from 'react';

import { indentUnit } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey, AcceptedUploadFileType } from '../../consts';
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
  acceptedFileType: AcceptedUploadFileType,
  onChange?: (value: string) => void,
  onUpload?: (files: File[]) => void,
  indentSize?: number,
}

export const CodeMirrorEditor = (props: Props): JSX.Element => {
  const {
    editorKey,
    acceptedFileType,
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
    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();

      if (event.clipboardData == null) {
        return;
      }

      if (onUpload != null && event.clipboardData.types.includes('Files')) {
        onUpload(Array.from(event.clipboardData.files));
      }

      if (event.clipboardData.types.includes('text/plain')) {
        const textData = event.clipboardData.getData('text/plain');
        codeMirrorEditor?.replaceText(textData);
      }
    };

    const extension = EditorView.domEventHandlers({
      paste: handlePaste,
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);
    return cleanupFunction;

  }, [codeMirrorEditor, onUpload]);

  useEffect(() => {

    const handleDrop = (event: DragEvent) => {
      // prevents conflicts between codemirror and react-dropzone during file drops.
      event.preventDefault();
    };

    const extension = EditorView.domEventHandlers({
      drop: handleDrop,
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);
    return cleanupFunction;

  }, [codeMirrorEditor]);

  const {
    getRootProps,
    isDragActive,
    isDragAccept,
    isUploading,
    isDragReject,
    open,
  } = useFileDropzone({ onUpload, acceptedFileType });

  const dropzoneClassName = useMemo(() => {
    if (isUploading) {
      return 'dropzone-uploading';
    }
    if (isDragAccept) {
      // return 'dropzone-accepted';
      return 'dropzone-regected';
    }
    if (isDragReject) {
      return 'dropzone-regected';
    }
    return '';
  }, [isDragAccept, isDragReject, isUploading]);

  const renderOverlay = useCallback(() => {
    if (isDragActive) {
      return (
        <div className="overlay overlay-dropzone-active">
          <span className="overlay-content">
          </span>
        </div>
      );
    }
    return <></>;
  }, [isDragActive]);

  return (
    <div className={`${style['codemirror-editor']} flex-expand-vert`}>
      <div {...getRootProps()} className={`dropzone ${dropzoneClassName} flex-expand-vert`}>
        {renderOverlay()}
        <CodeMirrorEditorContainer ref={containerRef} />
        <Toolbar onFileOpen={open} acceptedFileType={acceptedFileType} />
      </div>
    </div>
  );
};
