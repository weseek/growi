import type { EditorTheme, KeyMapMode, PasteMode } from '../../../consts';


import { InitEditorValueRow } from './controller/InitEditorValueRow';
import { KeymapControl } from './controller/KeymapControl';
import { PasteModeControl } from './controller/PasteModeControl';
import { SetCaretLineRow } from './controller/SetCaretLineRow';
import { ThemeControl } from './controller/ThemeControl';

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
      <ThemeControl setEditorTheme={setEditorTheme} />
      <KeymapControl setEditorKeymap={setEditorKeymap} />
      <PasteModeControl setEditorPaste={setEditorPaste} />
    </div>
  );
};
