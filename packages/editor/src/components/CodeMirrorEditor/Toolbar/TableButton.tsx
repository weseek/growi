import { useCallback } from 'react';

import { useHandsontableModal } from '../../../stores/use-hands-on-table';

export const TableButton = (): JSX.Element => {
  const { open: openTableModal } = useHandsontableModal();
  const openTableModalHandler = useCallback(() => {
    openTableModal();
  }, []);

  return (
    <button type="button" className="btn btn-toolbar-button" onClick={openTableModalHandler}>
      <span className="material-symbols-outlined fs-5">table_chart</span>
    </button>
  );
};
