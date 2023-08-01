import { useCallback } from 'react';

import { useCodeMirrorEditorMain } from '../../stores';

export const PlaygroundController = (): JSX.Element => {

  const { data: states } = useCodeMirrorEditorMain();

  const initEditorValue = useCallback(() => {
    if (states == null) {
      return;
    }

    states.view?.dispatch({
      changes: {
        from: 0,
        to: states.state?.doc.toString().length,
        insert: '# Header\n\n- foo\n-bar\n',
      },
    });

  }, [states]);

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
