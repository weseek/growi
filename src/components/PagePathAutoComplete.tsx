import React, { VFC } from 'react';

import { pathUtils } from 'growi-commons';

import SearchTypeahead from '../client/js/components/SearchTypeahead';

type Props={
  addTrailingSlash: boolean,
  onSubmit: ()=> void,
  onInputChange: (path:string)=> void,
  initializedPath?: string,
  autoFocus?: boolean,
}

export const PagePathAutoComplete:VFC<Props> = (props:Props) => {

  const {
    addTrailingSlash, onSubmit, onInputChange, initializedPath = '/', autoFocus = false,
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
      placeholder="Input page path"
      keywordOnInit={getKeywordOnInit(initializedPath)}
      autoFocus={autoFocus}
    />
  );

};
