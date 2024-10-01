import React, { useCallback } from 'react';

import { useRagSearchModal } from '~/stores/rag-search';

import styles from './RagSearchButton.module.scss';

const RagSearchButton = (): JSX.Element => {

  const { open: openRagSearchModal } = useRagSearchModal();

  const ragSearchButtonClickHandler = useCallback(() => {
    openRagSearchModal();
  }, [openRagSearchModal]);


  return (
    <button
      type="button"
      className={`btn btn-search ${styles['btn-rag-search']}`}
      onClick={ragSearchButtonClickHandler}
      data-testid="open-search-modal-button"
    >
      <span className="material-symbols-outlined">chat</span>
    </button>
  );
};

export default RagSearchButton;
