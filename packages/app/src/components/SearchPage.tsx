import React, {
  FC, useState, useCallback,
} from 'react';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';
import SearchControl from './SearchPage/SearchControl';
import { ActionToPagesType } from '../interfaces/search';


type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. implement PageDeleteModal
// 2. disable search form when this component is used in LegacyPage
// 3. onAfterSearchInvoked should be refactored in LegacyPage
const SearchPage : FC<Props> = (props: Props) => {

  // Delete modal
  const renderActionsToPageModal = (isDeleteConfirmModalShown, getSelectedPagesToDelete, closeDeleteConfirmModalHandler) => {
    return (
      <PageDeleteModal
        isOpen={isDeleteConfirmModalShown}
        pages={getSelectedPagesToDelete()}
        onClose={closeDeleteConfirmModalHandler}
        isDeleteCompletelyModal={false}
        isAbleToDeleteCompletely={false}
      />
    );
  };

  const onAfterSearchHandler = (keyword, searchedKeyword) => {
    let hash = window.location.hash || '';
    if (searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  };

  // eslint-disable-next-line max-len
  const renderSearchControl = (searchingKeyword, sort, order, searchResultCount, appContainer, onSearchInvoked, toggleAllCheckBox, selectAllCheckboxType, actionToAllPagesButtonHandler, switchExcludeUserPagesHandler, switchExcludeTrashPagesHandler, excludeUserPages, excludeTrashPages, onChangeSortInvoked) => {
    return (
      <SearchControl
        searchingKeyword={searchingKeyword}
        sort={sort}
        order={order}
        searchResultCount={searchResultCount || 0}
        appContainer={appContainer}
        onSearchInvoked={onSearchInvoked}
        onClickSelectAllCheckbox={toggleAllCheckBox}
        selectAllCheckboxType={selectAllCheckboxType}
        onClickActionButton={actionToAllPagesButtonHandler}
        onExcludeUserPagesSwitched={switchExcludeUserPagesHandler}
        onExcludeTrashPagesSwitched={switchExcludeTrashPagesHandler}
        excludeUserPages={excludeUserPages}
        excludeTrashPages={excludeTrashPages}
        onChangeSortInvoked={onChangeSortInvoked}
        actionType={ActionToPagesType.DELETE}
      >
      </SearchControl>
    );
  };

  return (
    <>
      <SearchCore
        onAfterSearchInvoked={onAfterSearchHandler}
        onRenderSearchControlInvoked={renderSearchControl}
        renderSearchControl={renderActionsToPageModal}
      />
    </>
  );
};
export default SearchPage;
