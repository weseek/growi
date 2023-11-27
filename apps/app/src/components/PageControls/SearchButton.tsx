import React, { useCallback } from 'react';

import { useSearchModal } from '~/stores/modal';

import styles from './SearchButton.module.scss';


const SearchButton = (): JSX.Element => {

  const { open: openSearchModal } = useSearchModal();

  const searchButtonClickHandler = useCallback(() => {
    openSearchModal();
  }, [openSearchModal]);


  return (
    <button
      type="button"
      className={`me-3 btn btn-search ${styles['btn-search']}`}
      onClick={searchButtonClickHandler}
    >
      <span className="material-symbols-outlined">search</span>
    </button>
  );
};

export default SearchButton;
