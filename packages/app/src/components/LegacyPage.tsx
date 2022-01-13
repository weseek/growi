import React, {
  FC,
} from 'react';
import PageMigrateModal from './PageMigrateModal';
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
const LegacyPage : FC<Props> = (props: Props) => {

  // migrate modal
  const renderActionsToPageModal = (isDeleteConfirmModalShown, getSelectedPagesToDelete, closeDeleteConfirmModalHandler) => {
    return (
      <PageMigrateModal
        isOpen={isDeleteConfirmModalShown}
        pages={getSelectedPagesToDelete()}
        onClose={closeDeleteConfirmModalHandler}
      />
    );
  };
  const onAfterSearchHandler = (keyword, searchedKeyword) => {
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
        actionType={ActionToPagesType.MIGRATE}
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
export default LegacyPage;
