import { useEffect, useRef, useState } from 'react';

import { EditorView } from '@codemirror/view';

import { CodeMirrorEditorContainer } from '..';
import { useCodeMirrorEditorMain } from '../../stores';

import { PlaygroundController } from './PlaygroundController';
import { Preview } from './Preview';

export const Playground = (): JSX.Element => {

  const [markdownToPreview, setMarkdownToPreview] = useState('');

  const containerRef = useRef(null);

  const { data: codeMirrorEditor } = useCodeMirrorEditorMain(containerRef.current);

  // set handler to save with shortcut key
  useEffect(() => {
    const extension = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.view.state.doc.toString();
        setMarkdownToPreview(doc);
      }
    });

    const cleanupFunction = codeMirrorEditor?.appendExtension?.(extension);

    return cleanupFunction;
  }, [codeMirrorEditor]);

  return (
    <>
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '83px' }}>
        <div className="text-white">GrowiSubNavigation</div>
      </div>
      <div className="flex-expand-horiz">
        <div className="flex-expand-vert">
          <CodeMirrorEditorContainer ref={containerRef} />
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
