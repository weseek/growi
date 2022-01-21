import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';
import SearchPageForm from './SearchPage/SearchPageForm';
import SortControl from './SearchPage/SortControl';


type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 3. message props to SearchPageLayout.
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

  const renderActionToPages = (isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionAllButton, onClickSelectAllCheckbox) => {
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
  };

  const renderSearchForm = (keyword, appContainer, onSearchInvoked) => {
    return <SearchPageForm keyword={keyword} appContainer={appContainer} onSearchFormChanged={onSearchInvoked}></SearchPageForm>;
  };

  const renderIncludeSpecificPath = (excludeUserPages, switchExcludeUserPagesHandler, excludeTrashPages, switchExcludeTrashPagesHandler) => {
    return (
      <div className="d-none d-lg-flex align-items-center ml-auto search-control-include-options">
        <div className="card mr-3 mb-0">
          <div className="card-body">
            <label className="search-include-label mb-0 d-flex align-items-center text-secondary with-no-font-weight" htmlFor="flexCheckDefault">
              <input
                checked={excludeUserPages}
                className="mr-2"
                type="checkbox"
                id="flexCheckDefault"
                onClick={switchExcludeUserPagesHandler}
              />
              {t('Include Subordinated Target Page', { target: '/user' })}
            </label>
          </div>
        </div>
        <div className="card mb-0">
          <div className="card-body">
            <label className="search-include-label mb-0 d-flex align-items-center text-secondary with-no-font-weight" htmlFor="flexCheckChecked">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckChecked"
                onClick={switchExcludeTrashPagesHandler}
                checked={excludeTrashPages}
              />
              {t('Include Subordinated Target Page', { target: '/trash' })}
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderSortControl = (sort, order, onChangeSortInvoked) => {
    return (
      <SortControl
        sort={sort}
        order={order}
        onChangeSortInvoked={onChangeSortInvoked}
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
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderActionToPagesModal={renderActionsToPageModal}
      renderActionToPages={renderActionToPages}
      renderSearchForm={renderSearchForm}
      shouldExcludeUserPages
      shouldExcludeTrashPages
      renderIncludeSpecificPath={renderIncludeSpecificPath}
      renderSortControl={renderSortControl}
    />
  );
};
export default SearchPage;
