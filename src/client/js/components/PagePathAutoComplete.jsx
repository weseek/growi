import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { pathUtils } from 'growi-commons';

import { TypeaheadMenu } from 'react-bootstrap-typeahead';
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

  const renderMenu = (results, menuProps) => {
    // Hide the menu when there are no results.
    if (results.length != null) {
      return null;
    }
    return <TypeaheadMenu {...menuProps} options={results} />;
  };

  return (
    <SearchTypeahead
      onSubmit={submitHandler}
      onChange={inputChangeHandler}
      onInputChange={props.onInputChange}
      inputName="new_path"
      onSearchError={setSearchError}
      renderMenu={renderMenu}
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
