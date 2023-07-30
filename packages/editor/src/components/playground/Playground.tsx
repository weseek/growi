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
    <CodeMirrorEditorContainer ref={containerRef} />
  );
};
