import {
  forwardRef, useMemo, useRef, useEffect, useState,
  DetailedHTMLProps,
} from 'react';

import { indentUnit } from '@codemirror/language';
import {
  EditorView,
} from '@codemirror/view';
import { AcceptedUploadFileType } from '@growi/core';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { EditorSettings, GlobalCodeMirrorEditorKey } from '../../consts';
import {
  useFileDropzone, FileDropzoneOverlay,
} from '../../services';
import {
  adjustPasteData, getStrFromBol,
} from '../../services/paste-util/paste-markdown-util';
import { isInTable } from '../../services/table-util/insert-new-row-to-table-markdown';
import { useDefaultExtensions, useCodeMirrorEditorIsolated, useEditorSettings } from '../../stores';

import { Toolbar } from './Toolbar';


import style from './CodeMirrorEditor.module.scss';

const CodeMirrorEditorContainer = forwardRef<HTMLDivElement, DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>(
  (props, ref) => {
    const { className = '', ...rest } = props;
    return (
      <div className={`${className} flex-expand-vert ${style['codemirror-editor-container']}`} ref={ref} {...rest} />
    );
  },
);

export type CodeMirrorEditorProps = {
  acceptedUploadFileType?: AcceptedUploadFileType,
  indentSize?: number,
  editorSettings?: EditorSettings,
  onChange?: (value: string) => void,
  onSave?: () => void,
  onUpload?: (files: File[]) => void,
  onScroll?: () => void,
}

type Props = CodeMirrorEditorProps & {
  editorKey: string | GlobalCodeMirrorEditorKey,
  hideToolbar?: boolean,
}

export const CodeMirrorEditor = (props: Props): JSX.Element => {
  const {
    editorKey,
    hideToolbar,

    acceptedUploadFileType = AcceptedUploadFileType.NONE,
    indentSize,
    editorSettings,
    onChange,
    onSave,
    onUpload,
    onScroll,
  } = props;

  const containerRef = useRef(null);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => {
    return {
      onChange,
    };
  }, [onChange]);
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey, containerRef.current, cmProps);

  const [editorClass, setEditorClass] = useState('');

  useDefaultExtensions(codeMirrorEditor);
  useEditorSettings(codeMirrorEditor, editorSettings, onSave);

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

    const markdownTableActivatedClass = 'markdown-table-activated';

    const handleMousedown = (event: Event) => {
      // event.preventDefault();

      const editor = codeMirrorEditor?.view;

      if (editor == null) {
        return;
      }

      if (isInTable(editor)) {
        // set class
        setEditorClass(markdownTableActivatedClass);
      }
      else {
        setEditorClass('');
      }
    };

    const extension = EditorView.domEventHandlers({
      mousedown: handleMousedown,
    });

    const cleanupFunction = codeMirrorEditor?.appendExtensions(extension);

    return cleanupFunction;

  }, [codeMirrorEditor]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isUploading,
  } = useFileDropzone({
    acceptedUploadFileType,
    onUpload,
    // ignore mouse and key events
    dropzoneOpts: {
      noClick: true,
      noKeyboard: true,
    },
  });

  const fileUploadState = useMemo(() => {

    if (isUploading) {
      return 'dropzone-uploading';
    }

    switch (acceptedUploadFileType) {
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
  }, [isUploading, isDragAccept, isDragReject, acceptedUploadFileType]);

  return (
    <div className={`${style['codemirror-editor']} ${editorClass} flex-expand-vert overflow-y-hidden`}>
      <div {...getRootProps()} className={`dropzone ${fileUploadState} flex-expand-vert`}>
        <input {...getInputProps()} />
        <FileDropzoneOverlay isEnabled={isDragActive} />
        <CodeMirrorEditorContainer ref={containerRef} />
      </div>
      { !hideToolbar && (
        <Toolbar
          editorKey={editorKey}
          acceptedUploadFileType={acceptedUploadFileType}
          onUpload={onUpload}
        />
      ) }
    </div>
  );
};
