import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { AcceptedUploadFileType } from '@growi/core';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { toast } from 'react-toastify';

import { GlobalCodeMirrorEditorKey } from '../../../consts';
import type {
  EditorSettings, EditorTheme, KeyMapMode, PasteMode,
} from '../../../consts';
import { CodeMirrorEditorMain } from '../../components/CodeMirrorEditorMain';
import { useCodeMirrorEditorIsolated } from '../../stores/codemirror-editor';

import { PlaygroundController } from './PlaygroundController';
import { Preview } from './Preview';

export const Playground = (): JSX.Element => {

  const [markdownToPreview, setMarkdownToPreview] = useState('');
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('defaultlight');
  const [editorKeymap, setEditorKeymap] = useState<KeyMapMode>('default');
  const [editorPaste, setEditorPaste] = useState<PasteMode>('both');
  const [unifiedMergeView, setUnifiedMergeView] = useState(false);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>();

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  const initialValue = '# header\n';

  // initialize
  useEffect(() => {
    codeMirrorEditor?.initDoc(initialValue);
    setMarkdownToPreview(initialValue);
  }, [codeMirrorEditor, initialValue]);

  // initial caret line
  useEffect(() => {
    codeMirrorEditor?.setCaretLine();
  }, [codeMirrorEditor]);

  useEffect(() => {
    setEditorSettings({
      theme: editorTheme,
      keymapMode: editorKeymap,
      styleActiveLine: true,
      autoFormatMarkdownTable: true,
      unifiedMergeView,
      pasteMode: editorPaste,
    });
  }, [setEditorSettings, editorKeymap, editorTheme, editorPaste, unifiedMergeView]);

  // set handler to save with shortcut key
  const saveHandler = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log({ doc: codeMirrorEditor?.getDoc() });
    toast.success('Saved.', { autoClose: 2000 });
  }, [codeMirrorEditor]);

  // the upload event handler
  // demo of uploading a file.
  const uploadHandler = useCallback((files: File[]) => {
    files.forEach((file) => {
      // set dummy file name.
      const insertText = `[${file.name}](/attachment/aaaabbbbccccdddd)\n`;
      codeMirrorEditor?.insertText(insertText);
    });

  }, [codeMirrorEditor]);

  const cmProps = useMemo<ReactCodeMirrorProps>(() => ({
    onChange: setMarkdownToPreview,
  }), []);

  return (
    <div className="d-flex flex-column vw-100 flex-expand-vh-100">
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '83px' }}>
        <div className="text-white">GrowiSubNavigation</div>
      </div>
      <div className="flex-expand-horiz">
        <div className="flex-expand-vert">
          <CodeMirrorEditorMain
            enableCollaboration
            onSave={saveHandler}
            onUpload={uploadHandler}
            indentSize={4}
            acceptedUploadFileType={AcceptedUploadFileType.ALL}
            editorSettings={editorSettings}
            cmProps={cmProps}
          />
        </div>
        <div className="flex-expand-vert d-none d-lg-flex bg-light text-dark border-start border-dark-subtle p-3">
          <Preview markdown={markdownToPreview} />
          <hr />
          <PlaygroundController
            setEditorTheme={setEditorTheme}
            setEditorKeymap={setEditorKeymap}
            setEditorPaste={setEditorPaste}
            setUnifiedMergeView={setUnifiedMergeView}
          />
        </div>
      </div>
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '50px' }}>
        <div className="text-white">EditorNavbarBottom</div>
      </div>
    </div>
  );
};
