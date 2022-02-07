import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import AppContainer from '~/client/services/AppContainer';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';
import SearchControl from './SearchPage/SearchControl';
import { withUnstatedContainers } from './UnstatedUtils';


type Props = {
  appContainer: AppContainer
}


const SearchPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  const renderActionToPages = useCallback((isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionAllButton, onClickSelectAllCheckbox) => {
    const actionIconAndText = (
      <>
        <i className="icon-trash"></i>
        delete
      </>
    );
    return (
      <ActionToSelectedPageGroup
        isSelectAllCheckboxDisabled={isSelectAllCheckboxDisabled}
        selectAllCheckboxType={selectAllCheckboxType}
        onClickActionAllButton={onClickActionAllButton}
        onClickSelectAllCheckbox={onClickSelectAllCheckbox}
        actionIconAndText={actionIconAndText}
      >
      </ActionToSelectedPageGroup>
    );
  }, []);


  const onAfterSearchHandler = useCallback((keyword, searchedKeyword) => {
    let hash = window.location.hash || '';
    if (searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  }, []);

  // eslint-disable-next-line max-len
  const renderSearchControl = useCallback((searchResultCount, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox, searchingKeyword, onSearchInvoked) => {
    return (
      <SearchControl
        appContainer={props.appContainer}
        actionToPageGroup={renderActionToPages(searchResultCount === 0, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox)}
        onSearchInvoked={onSearchInvoked}
        searchingKeyword={searchingKeyword}
      >
      </SearchControl>
    );
  }, [props.appContainer, renderActionToPages]);

  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderControl={renderSearchControl}
      excludeTrashPages
      excludeUserPages
    />
  );
};

/**
 * Wrapper component for using unstated
 */
const SearchPageUnstatedWrapper = withUnstatedContainers(SearchPage, [AppContainer]);

const SearchPageWrapper = (props) => {
  return <SearchPageUnstatedWrapper {...props}></SearchPageUnstatedWrapper>;
};
export default SearchPageWrapper;
