import { useCallback } from 'react';

import { useDrawioModalForEditor } from '../../../stores/use-drawio';

export const DiagramButton = (): JSX.Element => {
  const { open: openDrawioModal } = useDrawioModalForEditor();
  const openDrawioModalHandler = useCallback(() => {
    openDrawioModal();
  }, []);
  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openDrawioModalHandler}>
      <span className="material-symbols-outlined fs-5">lan</span>
    </button>
  );
};
