import { useEffect, useRef } from 'react';

import { CodeMirrorEditorContainer } from '..';
import { useCodeMirrorEditor } from '../../services';

export const Playground = (): JSX.Element => {

  const containerRef = useRef(null);

  const { setContainer } = useCodeMirrorEditor({
    container: containerRef.current,
  });

  useEffect(() => {
    if (containerRef.current != null) {
      setContainer(containerRef.current);
    }
  }, [setContainer]);

  return (
    <>
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center bg-dark" style={{ minHeight: '83px' }}>
        <div className="text-white">GrowiSubNavigation</div>
      </div>
      <div className="flex-grow-1 d-flex overflow-y-auto">
        <div className="flex-grow-1 d-flex flex-column" style={{ flexBasis: 0 }}>
          <CodeMirrorEditorContainer ref={containerRef} />
        </div>
        <div className="flex-grow-1 d-flex flex-column bg-light border-start border-dark-subtle p-3" style={{ flexBasis: 0 }}>
          <p>PREVIEW</p>
        </div>
      </div>
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center bg-dark" style={{ minHeight: '50px' }}>
        <div className="text-white">EditorNavbarBottom</div>
      </div>
    </>
  );
};
