import {
  useCallback, useEffect, useState,
} from 'react';

import { toast } from 'react-toastify';

import { GlobalCodeMirrorEditorKey } from '../../consts';
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

  return (
    <>
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '83px' }}>
        <div className="text-white">GrowiSubNavigation</div>
      </div>
      <div className="flex-expand-horiz">
        <div className="flex-expand-vert">
          <CodeMirrorEditorMain
            onSave={saveHandler}
            onChange={setMarkdownToPreview}
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
    </>
  );
};
