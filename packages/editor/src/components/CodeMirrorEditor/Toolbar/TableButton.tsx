import { useCallback } from 'react';

import { useCodeMirrorEditorIsolated } from '../../../stores';
import { useHandsontableModalForEditor } from '../../../stores/use-handsontable';

type Props = {
  editorKey: string,
}

export const TableButton = (props: Props): JSX.Element => {
  const { editorKey } = props;
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);
  const { open: openTableModal } = useHandsontableModalForEditor();
  const editor = codeMirrorEditor?.view;
  const openTableModalHandler = useCallback(() => {
    openTableModal(editor);
  }, [editor]);

  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTableModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
