import React from 'react';

import styles from './SearchButton.module.scss';

const SearchButton = (): JSX.Element => {
  return (
    <button type="button" className={`me-3 btn btn-search ${styles['btn-search']}`}>
      <span className="material-symbols-outlined">search</span>
    </button>
  );
};

export default SearchButton;
