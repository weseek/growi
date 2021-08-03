import React, { VFC } from 'react';

import { pathUtils } from 'growi-commons';

import { Menu, MenuItem } from 'react-bootstrap-typeahead';

import SearchTypeahead from '~/client/js/components/SearchTypeahead';
import UserPicture from '~/client/js/components/User/UserPicture';
import PageListMeta from '~/client/js/components/PageList/PageListMeta';
import PagePathLabel from '~/client/js/components/PageList/PagePathLabel';

type Props={
  addTrailingSlash?: boolean,
  onSubmit?: ()=> void,
  onInputChange: (path:string)=> void,
  initializedPath?: string,
  autoFocus?: boolean,
}

export const PagePathAutoComplete:VFC<Props> = (props:Props) => {

  const {
    addTrailingSlash = false, onSubmit, onInputChange, initializedPath = '/', autoFocus = false,
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
    if (!results.length) {
      return null;
    }

    return (
      <Menu {...menuProps}>
        {results.map((result, index) => {
        return (
          <MenuItem option={result} position={index}>
            <UserPicture user={result.lastUpdateUser} size="sm" noLink />
            <span className="ml-1 text-break text-wrap"><PagePathLabel page={result} /></span>
            <PageListMeta page={result} />
          </MenuItem>
          );
        })}
      </Menu>
    );
  };

  return (
    <SearchTypeahead
      onSubmit={submitHandler}
      onChange={inputChangeHandler}
      onInputChange={props.onInputChange}
      inputName="new_path"
      behaviorOfResetBtn="clear"
      renderMenu={renderMenu}
      placeholder="Input page path"
      keywordOnInit={getKeywordOnInit(initializedPath)}
      autoFocus={autoFocus}
    />
  );

};
