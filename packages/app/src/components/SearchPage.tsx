import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';
import ActionToPageGroup from './SearchPage/ActionToPageGroup';
import SearchControl from './SearchPage/SearchControl';


type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. disable search form when this component is used in LegacyPage
// 2. icon migrate
// 2. onAfterSearchInvoked should be refactored in LegacyPage
const SearchPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();

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

  const renderActionToPageGroup = (isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionButton, onClickSelectAllCheckbox) => {
    const actionTypeAndText = (
      <>
        <i className="icon-trash"></i>
        delete
      </>
    );
    return (
      <ActionToPageGroup
        actionTypeIconAndText={actionTypeAndText}
        isSelectAllCheckboxDisabled={isSelectAllCheckboxDisabled}
        selectAllCheckboxType={selectAllCheckboxType}
        onClickActionButton={onClickActionButton}
        onClickSelectAllCheckbox={onClickSelectAllCheckbox}
      >
      </ActionToPageGroup>
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

  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderActionToPagesModal={renderActionsToPageModal}
      renderActionToPageGroup={renderActionToPageGroup}
    />
  );
};
export default SearchPage;
