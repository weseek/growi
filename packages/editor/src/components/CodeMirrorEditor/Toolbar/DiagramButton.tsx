import { useCallback } from 'react';

import { useDrawioModalForEditor } from '../../../stores/use-drawio';

type Props = {
  editorKey: string,
}

export const DiagramButton = (props: Props): JSX.Element => {
  const { editorKey } = props;
  const { open: openDrawioModal } = useDrawioModalForEditor();
  const onClickDiagramButton = useCallback(() => {
    openDrawioModal(editorKey);
  }, [editorKey, openDrawioModal]);
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={onClickDiagramButton}>
      {/* <span className="growi-custom-icons">drawer_io</span> */}
      <span className="material-symbols-outlined fs-5">block</span>
    </button>
  );
};
