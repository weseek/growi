import { useCallback } from 'react';

import { useForm } from 'react-hook-form';

import type { EditorTheme, KeyMapMode, PasteMode } from '../../../consts';
import {
  GlobalCodeMirrorEditorKey,
  AllEditorTheme, AllKeyMap,
  AllPasteMode,
} from '../../../consts';
import { useCodeMirrorEditorIsolated } from '../../stores/codemirror-editor';

export const InitEditorValueRow = (): JSX.Element => {

  const { data } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  const initDoc = data?.initDoc;
  const initEditorValue = useCallback(() => {
    initDoc?.('# Header\n\n- foo\n-bar\n');
  }, [initDoc]);

  return (
    <div className="row">
      <div className="col">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => initEditorValue()}
        >
          Initialize editor value
        </button>
      </div>
    </div>
  );
};

type SetCaretLineRowFormData = {
  lineNumber: number | string;
};

export const SetCaretLineRow = (): JSX.Element => {

  const { data } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);
  const { register, handleSubmit } = useForm<SetCaretLineRowFormData>({
    defaultValues: {
      lineNumber: 1,
    },
  });

  const setCaretLine = data?.setCaretLine;
  const onSubmit = handleSubmit((submitData) => {
    const lineNumber = Number(submitData.lineNumber) || 1;
    setCaretLine?.(lineNumber);
  });

  return (
    <form className="row mt-3" onSubmit={onSubmit}>
      <div className="col">
        <div className="input-group">
          <input
            {...register('lineNumber')}
            type="number"
            className="form-control"
            placeholder="Input line number"
            aria-label="line number"
            aria-describedby="button-set-cursor"
          />
          <button type="submit" className="btn btn-outline-secondary" id="button-set-cursor">Set the cursor</button>
        </div>
      </div>
    </form>

  );
};


type OutlineSecondaryButtonsProps<V> = {
    update: (value: V) => void,
    items: V[],
}

const OutlineSecondaryButtons = <V extends { toString: () => string }, >(
  props: OutlineSecondaryButtonsProps<V>,
): JSX.Element => {
  const { update, items } = props;
  return (
    <div className="d-flex flex-wrap gap-1">
      { items.map((item) => {
        return (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              update(item);
            }}
          >
            {item.toString()}
          </button>
        );
      }) }
    </div>
  );
};


type PlaygroundControllerProps = {
  setEditorTheme: (value: EditorTheme) => void
  setEditorKeymap: (value: KeyMapMode) => void
  setEditorPaste: (value: PasteMode) => void
};

export const PlaygroundController = (props: PlaygroundControllerProps): JSX.Element => {
  const { setEditorTheme, setEditorKeymap, setEditorPaste } = props;
  return (
    <div className="container">
      <InitEditorValueRow />

      <SetCaretLineRow />

      <div className="row mt-5">
        <h2>Themes</h2>
        <div className="col">
          <OutlineSecondaryButtons<EditorTheme> update={setEditorTheme} items={AllEditorTheme} />
        </div>
      </div>

      <div className="row mt-5">
        <h2>Keymaps</h2>
        <div className="col">
          <OutlineSecondaryButtons<KeyMapMode> update={setEditorKeymap} items={AllKeyMap} />
        </div>
      </div>

      <div className="row mt-5">
        <h2>Paste mode</h2>
        <div className="col">
          <OutlineSecondaryButtons<PasteMode> update={setEditorPaste} items={AllPasteMode} />
        </div>
      </div>

    </div>
  );
};
