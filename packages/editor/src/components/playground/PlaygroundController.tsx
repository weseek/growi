import { useCallback } from 'react';

import { useCodeMirrorEditorMain } from '../../stores';

export const PlaygroundController = (): JSX.Element => {

  const { data } = useCodeMirrorEditorMain();

  const initState = data?.initState;
  const initEditorValue = useCallback(() => {
    initState?.({ doc: '# Header\n\n- foo\n-bar\n' });
  }, [initState]);

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
