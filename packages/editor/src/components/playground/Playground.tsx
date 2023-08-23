import { useRef } from 'react';

import { CodeMirrorEditorContainer } from '..';
import { useCodeMirrorEditorMain } from '../../stores';

import { PlaygroundController } from './PlaygroundController';

export const Playground = (): JSX.Element => {

  const containerRef = useRef(null);

  useCodeMirrorEditorMain({
    container: containerRef.current,
  });

  return (
    <>
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '83px' }}>
        <div className="text-white">GrowiSubNavigation</div>
      </div>
      <div className="flex-grow-1 d-flex overflow-y-auto">
        <div className="flex-expand-vert">
          <CodeMirrorEditorContainer ref={containerRef} />
        </div>
        <div className="flex-expand-vert d-none d-lg-flex bg-light text-dark border-start border-dark-subtle p-3">
          <PlaygroundController />
        </div>
      </div>
      <div className="flex-expand-vert justify-content-center align-items-center bg-dark" style={{ minHeight: '50px' }}>
        <div className="text-white">EditorNavbarBottom</div>
      </div>
    </>
  );
};
