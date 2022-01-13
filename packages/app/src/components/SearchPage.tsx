import React, {
  FC, useState, useCallback,
} from 'react';
import { apiGet } from '~/client/util/apiv1-client';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';

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


  return (
    <>
      <SearchCore
        onAfterSearchInvoked={onAfterSearchHandler}
        renderActionToPagesModal={renderActionsToPageModal}
      />
    </>
  );
};
export default SearchPage;
