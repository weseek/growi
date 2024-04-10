import React, {
  useCallback,
} from 'react';

import { useSearchModal } from '../../features/search/client/stores/search';

type Props = {
  keywordOnInit: string,
};

export const SearchModalTriggerinput: React.FC<Props> = (props: Props) => {
  const { keywordOnInit } = props;

  const { open: openSearchModal } = useSearchModal();

  const inputClickHandler = useCallback(() => {
    openSearchModal(keywordOnInit);
  }, [openSearchModal, keywordOnInit]);

  return (
    <div>
      <input
        className="form-control"
        type="input"
        data-testid="open-search-modal-button"
        value={keywordOnInit}
        onClick={inputClickHandler}
        readOnly
      />
    </div>
  );
};
