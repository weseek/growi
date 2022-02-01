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
  const [isActionToPageModalShown, setIsActionToPageModalShown] = useState<boolean>(false);


  // Delete modal
  const renderActionToPageModal = useCallback((getSelectedPagesForAction) => {
    return (
      <PageDeleteModal
        isOpen={isActionToPageModalShown}
        pages={getSelectedPagesForAction()}
        onClose={() => { setIsActionToPageModalShown(prev => !prev) }}
        isDeleteCompletelyModal={false}
        isAbleToDeleteCompletely={false}
      />
    );
  }, []);

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
  const renderSearchControl = useCallback((searchingKeyword, onSearchInvoked, searchResultCount, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox) => {
    return (
      <SearchControl
        searchingKeyword={searchingKeyword}
        appContainer={props.appContainer}
        onSearchInvoked={onSearchInvoked}
        actionToPageGroup={renderActionToPages(searchResultCount === 0, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox)}
      >
      </SearchControl>
    );
  }, []);

  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderControl={renderSearchControl}
      renderActionToPageModal={renderActionToPageModal}
      setIsActionToPageModalShown={setIsActionToPageModalShown}
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
