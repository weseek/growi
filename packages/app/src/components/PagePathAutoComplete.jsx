import React from 'react';
import PropTypes from 'prop-types';

import { pathUtils } from '@growi/core';

import SearchTypeahead from './SearchTypeahead';

const PagePathAutoComplete = (props) => {

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

  return (
    <SearchTypeahead
      onSubmit={submitHandler}
      onChange={inputChangeHandler}
      onInputChange={props.onInputChange}
      inputName="new_path"
      behaviorOfResetBtn="clear"
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
