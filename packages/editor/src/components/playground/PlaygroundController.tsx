import { useCallback } from 'react';

import { useCodeMirrorEditorMain } from '../../stores';

export const PlaygroundController = (): JSX.Element => {

  const { initDoc } = useCodeMirrorEditorMain();

  const initEditorValue = useCallback(() => {

    initDoc('# Header\n\n- foo\n-bar\n');

  }, [initDoc]);

  return (
    <>
      <div className="row">
        <div className="column">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => initEditorValue()}
          >
            Initialize editor value
          </button>
        </div>
      </div>
    </>
  );
};
