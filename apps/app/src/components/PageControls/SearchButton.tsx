import React from 'react';

import styles from './SearchButton.module.scss';

const SearchButton = (): JSX.Element => {
  return (
    <button type="button" className={`me-3 btn border-0 d-flex align-items-center ${styles['btn-search']}`}>
      <span className="material-symbols-outlined fill">search</span>
    </button>
  );
};

export default SearchButton;
