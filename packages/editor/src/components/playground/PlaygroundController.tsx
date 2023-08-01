import { useCallback } from 'react';

export const PlaygroundController = (): JSX.Element => {

  const initEditorValue = useCallback(() => {

  }, []);

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
