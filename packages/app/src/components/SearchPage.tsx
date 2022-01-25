import React, {
  FC, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageDeleteModal from './PageDeleteModal';
import SearchCore from './SearchCore';
import SearchOptionModal from './SearchPage/SearchOptionModal';
import SearchPageForm from './SearchPage/SearchPageForm';
import SortControl from './SearchPage/SortControl';


type Props = {

}


const SearchPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const [excludeUserPages, setExcludeUserPages] = useState<boolean>(true);
  const [excludeTrashPages, setExcludeTrashPages] = useState<boolean>(true);

  // Delete modal
  const renderActionToPageModal = (isActionConfirmModalShown, getSelectedPagesForAction, closeActionConfirmModalHandler) => {
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

  const renderIncludeSpecificPath = (
    <div className="d-none d-lg-flex align-items-center ml-auto search-control-include-options">
      <div className="card mr-3 mb-0">
        <div className="card-body">
          <label className="search-include-label mb-0 d-flex align-items-center text-secondary with-no-font-weight" htmlFor="flexCheckDefault">
            <input
              checked={!excludeUserPages}
              className="mr-2"
              type="checkbox"
              id="flexCheckDefault"
              onClick={() => { setExcludeUserPages(prev => !prev) }}
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
              onClick={() => { setExcludeTrashPages(prev => !prev) }}
              checked={!excludeTrashPages}
            />
            {t('Include Subordinated Target Page', { target: '/trash' })}
          </label>
        </div>
      </div>
    </div>
  );

  // This is modal for includeSpecificpath button (visible only in sp size)
  const renderSearchOptionModal = (isFileterOptionModalShown, onRetrySearchInvoked, closeSearchOptionModalHandler) => {
    return (
      <SearchOptionModal
        isOpen={isFileterOptionModalShown}
        onClickFilteringSearchResult={onRetrySearchInvoked}
        onClose={closeSearchOptionModalHandler}
        onExcludeUserPagesSwitched={() => { setExcludeUserPages(prev => !prev) }}
        onExcludeTrashPagesSwitched={() => { setExcludeTrashPages(prev => !prev) }}
        excludeUserPages={excludeUserPages}
        excludeTrashPages={excludeTrashPages}
      />
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
      renderActionToPagesModal={renderActionToPageModal}
      renderActionToPages={renderActionToPages}
      renderSearchForm={renderSearchForm}
      renderIncludeSpecificPath={renderIncludeSpecificPath}
      renderSearchOptionModal={renderSearchOptionModal}
      renderSortControl={renderSortControl}
      excludeUserPages={excludeUserPages}
      excludeTrashPages={excludeTrashPages}
    />
  );
};
export default SearchPage;
