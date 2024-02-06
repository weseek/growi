import {
  forwardRef, useMemo, useRef, useEffect,
} from 'react';

import { indentUnit } from '@codemirror/language';
import { Prec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey, AcceptedUploadFileType } from '../../consts';
import { useFileDropzone, FileDropzoneOverlay, AllEditorTheme } from '../../services';
import {
  adjustPasteData, getStrFromBol,
} from '../../services/list-util/markdown-list-util';
import { useCodeMirrorEditorIsolated } from '../../stores';

import { Toolbar } from './Toolbar';


import style from './CodeMirrorEditor.module.scss';

const CodeMirrorEditorContainer = forwardRef<HTMLDivElement, { editorKey: string | GlobalCodeMirrorEditorKey }>((props, ref) => {
  const { editorKey } = props;
  const styles = editorKey === GlobalCodeMirrorEditorKey.MAIN ? style['codemirror-editor-main-container'] : style['codemirror-editor-comment-container'];

  return (
    <div {...props} className={`flex-expand-vert ${styles}`} ref={ref} />
  );
});

type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  acceptedFileType: AcceptedUploadFileType,
  onChange?: (value: string) => void,
  onUpload?: (files: File[]) => void,
  onScroll?: () => void,
  indentSize?: number,
  editorTheme?: string,
}

export const CodeMirrorEditor = (props: Props): JSX.Element => {
  const {
    editorKey,
    acceptedFileType,
    onChange,
    onUpload,
    onScroll,
    indentSize,
    editorTheme,
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

      const editor = codeMirrorEditor?.view;

      if (editor == null) {
        return;
      }

      if (event.clipboardData == null) {
        return;
      }

      if (onUpload != null && event.clipboardData.types.includes('Files')) {
        onUpload(Array.from(event.clipboardData.files));
      }

      if (event.clipboardData.types.includes('text/plain')) {

        const textData = event.clipboardData.getData('text/plain');

        const strFromBol = getStrFromBol(editor);

        const adjusted = adjustPasteData(strFromBol, textData);

        codeMirrorEditor?.replaceText(adjusted);
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

  useEffect(() => {

    const handleScroll = (event: Event) => {
      event.preventDefault();
      if (onScroll != null) {
        onScroll();
      }
    };

    const extension = EditorView.domEventHandlers({
      scroll: handleScroll,
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);
    return cleanupFunction;

  }, [onScroll, codeMirrorEditor]);

  useEffect(() => {
    if (editorTheme == null) {
      return;
    }
    if (AllEditorTheme[editorTheme] == null) {
      return;
    }

    const extension = AllEditorTheme[editorTheme];

    // React CodeMirror has default theme which is default prec
    // and extension have to be higher prec here than default theme.
    const cleanupFunction = codeMirrorEditor?.appendExtensions(Prec.high(extension));
    return cleanupFunction;

  }, [codeMirrorEditor, editorTheme]);

  const {
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isUploading,
    open,
  } = useFileDropzone({ onUpload, acceptedFileType });

  const fileUploadState = useMemo(() => {

    if (isUploading) {
      return 'dropzone-uploading';
    }

    switch (acceptedFileType) {
      case AcceptedUploadFileType.NONE:
        return 'dropzone-disabled';

      case AcceptedUploadFileType.IMAGE:
        if (isDragAccept) {
          return 'dropzone-accepted';
        }
        if (isDragReject) {
          return 'dropzone-mismatch-picture';
        }
        break;

      case AcceptedUploadFileType.ALL:
        if (isDragAccept) {
          return 'dropzone-accepted';
        }
        if (isDragReject) {
          return 'dropzone-rejected';
        }
        break;
    }

    return '';
  }, [isUploading, isDragAccept, isDragReject, acceptedFileType]);

  return (
    <div className={`${style['codemirror-editor']} flex-expand-vert}`}>
      <div {...getRootProps()} className={`dropzone ${fileUploadState} flex-expand-vert`}>
        <FileDropzoneOverlay isEnabled={isDragActive} />
        <CodeMirrorEditorContainer editorKey={editorKey} ref={containerRef} />
        <Toolbar editorKey={editorKey} onFileOpen={open} acceptedFileType={acceptedFileType} />
      </div>
    </div>
  );
};
