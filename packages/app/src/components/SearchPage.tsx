import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';


type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. renderSearchForm
// 2. icon migrate
// 3.. onAfterSearchInvoked should be refactored in LegacyPage

const SearchPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  const actionIconAndText = (
    <>
      <i className="icon-trash"></i>
      delete
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

  const renderSearchForm = () => {
    // TODO
    // Task : https://redmine.weseek.co.jp/issues/85465
    // return <SearchForm />
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
      actionIconAndText={actionIconAndText}
    />
  );
};
export default SearchPage;
