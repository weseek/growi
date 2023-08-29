import {
  useEffect, useMemo, useRef, useState,
} from 'react';

import { EditorView } from '@codemirror/view';
import { ReactCodeMirrorProps, UseCodeMirror } from '@uiw/react-codemirror';

import { CodeMirrorEditorContainer } from '..';
import { useCodeMirrorEditorMain } from '../../stores';

import { PlaygroundController } from './PlaygroundController';
import { Preview } from './Preview';

export const Playground = (): JSX.Element => {

  const [markdownToPreview, setMarkdownToPreview] = useState('');

  const containerRef = useRef(null);

  const props = useMemo<ReactCodeMirrorProps>(() => {
    return {
      onChange: setMarkdownToPreview,
    };
  }, []);
  const { data: codeMirrorEditor } = useCodeMirrorEditorMain(containerRef.current, props);

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
