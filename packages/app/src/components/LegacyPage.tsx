import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';
import SearchControl from './SearchPage/SearchControl';

type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. implement PageDeleteModal
// 2. disable search form when this component is used in LegacyPage
// 3. onAfterSearchInvoked should be refactored in LegacyPage
const LegacyPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const actionTypeAndText = (
    <>
      <i className="icon-trash"></i>
      migrate
    </>
  );
  // migrate modal
  const renderActionsToPageModal = (isActionConfirmModalShown, getSelectedPagesForAction, closeActionConfirmModalHandler) => {
    return (
      <PageMigrateModal
        isOpen={isActionConfirmModalShown}
        pages={getSelectedPagesForAction()}
        onClose={closeActionConfirmModalHandler}
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
export default LegacyPage;
