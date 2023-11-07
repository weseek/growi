import {
  useCallback, useEffect, useState,
} from 'react';

import { toast } from 'react-toastify';

import { AcceptedUploadFileType, GlobalCodeMirrorEditorKey } from '../../consts';
import { useCodeMirrorEditorIsolated } from '../../stores';
import { CodeMirrorEditorMain } from '../CodeMirrorEditorMain';

import { PlaygroundController } from './PlaygroundController';
import { Preview } from './Preview';

export const Playground = (): JSX.Element => {

  const [markdownToPreview, setMarkdownToPreview] = useState('');

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

  return (
    <div className="d-flex flex-column vw-100 flex-expand-vh-100">
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '83px' }}>
        <div className="text-white">GrowiSubNavigation</div>
      </div>
      <div className="flex-expand-horiz">
        <div className="flex-expand-vert">
          <CodeMirrorEditorMain
            onSave={saveHandler}
            onChange={setMarkdownToPreview}
            onUpload={uploadHandler}
            indentSize={4}
            acceptedFileType={AcceptedUploadFileType.ALL}
          />
        </div>
        <div className="flex-expand-vert d-none d-lg-flex bg-light text-dark border-start border-dark-subtle p-3">
          <Preview markdown={markdownToPreview} />
          <PlaygroundController />
        </div>
      </div>
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '50px' }}>
        <div className="text-white">EditorNavbarBottom</div>
      </div>
    </div>
  );
};
