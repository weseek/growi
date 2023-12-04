import { useCallback } from 'react';

import { useDrawioModalForEditor } from '../../../stores/use-drawio';

export const DiagramButton = (): JSX.Element => {
  const { open: openDrawioModal } = useDrawioModalForEditor();
  const onClickOpenDrawioModal = useCallback(() => {
    openDrawioModal();
  }, [openDrawioModal]);
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={onClickOpenDrawioModal}>
      <span className="material-symbols-outlined fs-5">lan</span>
    </button>
  );
};
