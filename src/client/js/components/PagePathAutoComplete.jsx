import React from 'react';
import PropTypes from 'prop-types';

import { pathUtils } from 'growi-commons';

import SearchTypeahead from './SearchTypeahead';

const PagePathAutoComplete = (props) => {

  const {
    addTrailingSlash, onClickSubmit, onInputChange, initializedPath,
  } = props;

  function onChange(pages) {
    const page = pages[0]; // should be single page selected

    if (page != null) {
      onInputChange(page.path);
    }
  }

  function getKeywordOnInit(path) {
    return addTrailingSlash
      ? pathUtils.addTrailingSlash(path)
      : pathUtils.removeTrailingSlash(path);
  }

  return (
    <SearchTypeahead
      crowi={props.crowi}
      onSubmit={onClickSubmit}
      onChange={onChange}
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

  onClickSubmit:    PropTypes.func.isRequired,
  onInputChange:    PropTypes.func.isRequired,
};

PagePathAutoComplete.defaultProps = {
  initializedPath: '/',
  addTrailingSlash: true,
};

export default PagePathAutoComplete;
