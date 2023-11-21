import { useCallback, useEffect } from 'react';

import { useCodeMirrorEditorIsolated } from '../../../stores';
import { useHandsontableModal } from '../../../stores/use-handosontable';


type TableButtonProps = {
  editorKey: string,
}

export const TableButton = (props: TableButtonProps): JSX.Element => {
  const { editorKey } = props;
  const { open: openHandsontableModal } = useHandsontableModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);
  useEffect(() => {
    if (codeMirrorEditor) {
      const editor = codeMirrorEditor.view;
      openHandsontableModal(editor);
    }
  }, [codeMirrorEditor, openHandsontableModal]);
  const openTableModalHandler = useCallback(() => {
    const editor = codeMirrorEditor?.view;
    openHandsontableModal(editor);
  }, [codeMirrorEditor?.view, openHandsontableModal]);
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTableModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
