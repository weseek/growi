import { useCallback } from 'react';

import { useCodeMirrorEditorIsolated } from '../../../stores';
import { useDrawioModalForEditor } from '../../../stores/use-drawio';


type Props = {
  editorKey: string,
}

export const DiagramButton = (props: Props): JSX.Element => {
  const { editorKey } = props;
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);
  const { open: openDrawioModal } = useDrawioModalForEditor();
  const editor = codeMirrorEditor?.view;
  const onClickDiagramButton = useCallback(() => {
    openDrawioModal(editor);
  }, [editor, openDrawioModal]);
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={onClickDiagramButton}>
      <span className="material-symbols-outlined fs-5">lan</span>
    </button>
  );
};
