import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { pathUtils } from 'growi-commons';

import { useTranslation } from '~/i18n';
import SearchTypeahead from './SearchTypeahead';

const PagePathAutoComplete = (props) => {
  const [searchError, setSearchError] = useState(null);
  const { t } = useTranslation();

  const {
    addTrailingSlash, onSubmit, onInputChange, initializedPath,
  } = props;

  function inputChangeHandler(pages) {
    if (onInputChange == null) {
      return;
    }
    const page = pages[0]; // should be single page selected

    if (page != null) {
      onInputChange(page.path);
    }
  }

  function submitHandler() {
    if (onSubmit == null) {
      return;
    }
    onSubmit();
  }

  function getKeywordOnInit(path) {
    return addTrailingSlash
      ? pathUtils.addTrailingSlash(path)
      : pathUtils.removeTrailingSlash(path);
  }

  const emptyLabel = (searchError != null)
    ? 'Error on searching.'
    : t('search.search page bodies');

  return (
    <SearchTypeahead
      onSubmit={submitHandler}
      onChange={inputChangeHandler}
      onInputChange={props.onInputChange}
      inputName="new_path"
      onSearchError={setSearchError}
      emptyLabel={emptyLabel}
      placeholder="Input page path"
      keywordOnInit={getKeywordOnInit(initializedPath)}
      autoFocus={props.autoFocus}
    />
  );

};

PagePathAutoComplete.propTypes = {
  initializedPath:  PropTypes.string,
  addTrailingSlash: PropTypes.bool,

  onSubmit:         PropTypes.func,
  onInputChange:    PropTypes.func,
  autoFocus:        PropTypes.bool,
};

PagePathAutoComplete.defaultProps = {
  initializedPath:  '/',
  autoFocus:        false,
};

export default PagePathAutoComplete;
