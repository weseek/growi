import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';
import SearchControl from './SearchPage/SearchControl';


type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. implement PageDeleteModal
// 2. disable search form when this component is used in LegacyPage
// 3. onAfterSearchInvoked should be refactored in LegacyPage
const SearchPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const actionTypeAndText = (
    <>
      <i className="icon-trash"></i>
      {t('search_result.delete_all_selected_page')}
    </>
  );

  // Delete modal
  const renderActionsToPageModal = (isActionConfirmModalShown, getSelectedPagesForAction, closeActionConfirmModalHandler) => {
    return (
      <PageDeleteModal
        isOpen={isActionConfirmModalShown}
        pages={getSelectedPagesForAction()}
        onClose={closeActionConfirmModalHandler}
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
        actionTypeIconAndText={actionTypeAndText}
      >
      </SearchControl>
    );
  };

  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderActionToPagesModal={renderActionsToPageModal}
      renderSearchControl={renderSearchControl}
    />
  );
};
export default SearchPage;
