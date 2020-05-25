import React from 'react';
import PropTypes from 'prop-types';

import { pathUtils } from 'growi-commons';

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
      crowi={props.crowi}
      onSubmit={submitHandler}
      onChange={inputChangeHandler}
      onInputChange={onInputChange}
      inputName="new_path"
      emptyLabelExceptError={null}
      placeholder="Input page path"
      keywordOnInit={getKeywordOnInit(initializedPath)}
    />
  );

};

PagePathAutoComplete.propTypes = {
  crowi:            PropTypes.object.isRequired,
  initializedPath:  PropTypes.string,
  addTrailingSlash: PropTypes.bool,

  onSubmit:         PropTypes.func,
  onInputChange:    PropTypes.func,
};

PagePathAutoComplete.defaultProps = {
  initializedPath: '/',
  addTrailingSlash: true,
};

export default PagePathAutoComplete;
