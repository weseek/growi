import {
  useEffect, useMemo, useRef, useState,
} from 'react';

import { keymap } from '@codemirror/view';
import { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    codeMirrorEditor?.initDoc('# header\n');
  }, [codeMirrorEditor]);

  // set handler to save with shortcut key
  useEffect(() => {
    const extension = keymap.of([
      {
        key: 'Mod-s',
        preventDefault: true,
        run: () => {
          // eslint-disable-next-line no-console
          console.log({ doc: codeMirrorEditor?.getDoc() });
          toast.success('Saved.', { autoClose: 2000 });
          return true;
        },
      },
    ]);

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
