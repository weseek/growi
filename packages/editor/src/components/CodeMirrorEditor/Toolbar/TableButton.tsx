import { useCallback } from 'react';

import { useCodeMirrorEditorIsolated } from '../../../stores';
import { useHandsontableModal } from '../../../stores/use-hands-on-table';

type Props = {
  editorKey: string,
}

export const TableButton = (props: Props): JSX.Element => {
  const { editorKey } = props;

  const { open: openTableModal } = useHandsontableModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);

  const openTableModalHandler = useCallback(() => {
    const editor = codeMirrorEditor?.view;
    openTableModal(editor);
  }, [codeMirrorEditor]);

  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTableModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
