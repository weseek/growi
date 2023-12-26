import {
  forwardRef, useMemo, useRef, useEffect,
} from 'react';

import { indentUnit } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

import { GlobalCodeMirrorEditorKey, AcceptedUploadFileType } from '../../consts';
import { useFileDropzone, FileDropzoneOverlay } from '../../services';
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

  /**
   * return the postion of the BOL(beginning of line)
   */
  const getBol = (editor: EditorView) => {
    const curPos = editor.state.selection.main.head;
    return editor.state.doc.lineAt(curPos).from;
  };

  const getStrFromBol = (editor: EditorView) => {
    const curPos = editor.state.selection.main.head;
    return editor.state.sliceDoc(getBol(editor), curPos);
  };

  const selectLowerPos = (editor: EditorView, pos1: number, pos2: number) => {
    // if both is in same line
    if (editor.state.doc.lineAt(pos1).number === editor.state.doc.lineAt(pos2).number) {
      return (editor.state.doc.lineAt(pos1).from < editor.state.doc.lineAt(pos1).to) ? pos2 : pos1;
    }
    return (editor.state.doc.lineAt(pos1) < editor.state.doc.lineAt(pos2)) ? pos2 : pos1;
  };

  const replaceBolToCurrentPos = (editor: EditorView, text: string) => {
    const curPos = editor.state.selection.main.head;
    const pos = selectLowerPos(editor, editor.state.doc.lineAt(curPos).from, editor.state.doc.lineAt(curPos).to);
    editor.dispatch({
      changes: {
        from: getBol(editor),
        to: pos,
        insert: text,
      },
    });
  };

  const indentAndMarkOnlyRE = /^(\d+)[.)](\s*)$/;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const newlineAndIndentContinueMarkdownList = (editor: EditorView) => {
    const strFromBol = getStrFromBol(editor);

    if (indentAndMarkOnlyRE.test(strFromBol)) {
      replaceBolToCurrentPos(editor, '1. ');
    }
  };

  useEffect(() => {
    const handleEnterKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const editor = codeMirrorEditor?.view;
        newlineAndIndentContinueMarkdownList(editor);
      }
    };

    codeMirrorEditor?.view?.dom.addEventListener('keydown', handleEnterKey);

    return () => {
      codeMirrorEditor?.view?.dom.removeEventListener('keydown', handleEnterKey);
    };
  }, [codeMirrorEditor, newlineAndIndentContinueMarkdownList]);

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
    <div className={`${style['codemirror-editor']} flex-expand-vert`}>
      <div {...getRootProps()} className={`dropzone ${fileUploadState} flex-expand-vert`}>
        <FileDropzoneOverlay isEnabled={isDragActive} />
        <CodeMirrorEditorContainer ref={containerRef} />
        <Toolbar editorKey={editorKey} onFileOpen={open} acceptedFileType={acceptedFileType} />
      </div>
    </div>
  );
};
