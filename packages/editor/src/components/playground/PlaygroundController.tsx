import { useCallback } from 'react';

import { EditorState } from '@codemirror/state';
import { basicSetup } from '@uiw/react-codemirror';

import { defaultExtensions } from '../../services/codemirror-editor';
import { useCodeMirrorEditorMain } from '../../stores';

export const PlaygroundController = (): JSX.Element => {

  const { data: states } = useCodeMirrorEditorMain();

  const initEditorValue = useCallback(() => {
    if (states?.view == null) {
      return;
    }

    const newState = EditorState.create({
      doc: '# Header\n\n- foo\n-bar\n',
      extensions: [
        ...basicSetup(),
        defaultExtensions,
      ],
    });

    states.view?.setState(newState);

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
