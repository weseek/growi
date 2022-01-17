import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import SearchOptionModal from './SearchOptionModal';
import SortControl from './SortControl';
import {
  CheckboxType, SORT_AXIS, SORT_ORDER,
} from '../../interfaces/search';

type Props = {
  searchingKeyword: string,
  sort: SORT_AXIS,
  order: SORT_ORDER,
  appContainer: AppContainer,
  searchResultCount: number,
  selectAllCheckboxType: CheckboxType,
  renderActionToPageGroup: (isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionButton, onClickSelectAllCheckbox)=> React.FunctionComponent,
  onClickActionButton?: () => void
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
  excludeUserPages: boolean,
  excludeTrashPages: boolean,
  onSearchInvoked: (data: {keyword: string}) => Promise<void>
  onExcludeUserPagesSwitched?: () => void,
  onExcludeTrashPagesSwitched?: () => void,
  onChangeSortInvoked?: (nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => void,
}

const SearchControl: FC <Props> = (props: Props) => {

  const [isFileterOptionModalShown, setIsFileterOptionModalShown] = useState(false);
  // Temporaly workaround for lint error
  // later needs to be fixed: SearchControl to typescript componet
  const SearchPageFormTypeAny : any = SearchPageForm;
  const { t } = useTranslation('');
  const { searchResultCount } = props;

  const switchExcludeUserPagesHandler = () => {
    if (props.onExcludeUserPagesSwitched != null) {
      props.onExcludeUserPagesSwitched();
    }
  };

  const switchExcludeTrashPagesHandler = () => {
    if (props.onExcludeTrashPagesSwitched != null) {
      props.onExcludeTrashPagesSwitched();
    }
  };

  const onChangeSortInvoked = (nextSort: SORT_AXIS, nextOrder:SORT_ORDER) => {
    if (props.onChangeSortInvoked != null) {
      props.onChangeSortInvoked(nextSort, nextOrder);
    }
  };

  const openSearchOptionModalHandler = () => {
    setIsFileterOptionModalShown(true);
  };

  const closeSearchOptionModalHandler = () => {
    setIsFileterOptionModalShown(false);
  };

  const onRetrySearchInvoked = () => {
    if (props.onSearchInvoked != null) {
      props.onSearchInvoked({ keyword: props.searchingKeyword });
    }
  };

  const rednerSearchOptionModal = () => {
    return (
      <SearchOptionModal
        isOpen={isFileterOptionModalShown || false}
        onClickFilteringSearchResult={onRetrySearchInvoked}
        onClose={closeSearchOptionModalHandler}
        onExcludeUserPagesSwitched={switchExcludeUserPagesHandler}
        onExcludeTrashPagesSwitched={switchExcludeTrashPagesHandler}
        excludeUserPages={props.excludeUserPages}
        excludeTrashPages={props.excludeTrashPages}
      />
    );
  };

  const renderSortControl = () => {
    return (
      <SortControl
        sort={props.sort}
        order={props.order}
        onChangeSortInvoked={onChangeSortInvoked}
      />
    );
  };

  return (
    <div className="position-sticky fixed-top shadow-sm">
      <div className="grw-search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          <SearchPageFormTypeAny
            keyword={props.searchingKeyword}
            appContainer={props.appContainer}
            onSearchFormChanged={props.onSearchInvoked}
          />
        </div>

        {/* sort option: show when screen is larger than lg */}
        <div className="mr-4 d-lg-flex d-none">
          {renderSortControl()}
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="search-control d-flex align-items-center py-md-2 py-3 px-md-4 px-3 border-bottom border-gray">
        <div className="d-flex pl-md-2">
          {/* Todo: design will be fixed in #80324. Function will be implemented in #77525 */}
          {props.renderActionToPageGroup(searchResultCount === 0, props.selectAllCheckboxType, props.onClickActionButton, props.onClickSelectAllCheckbox)}
        </div>
        {/* sort option: show when screen is smaller than lg */}
        <div className="mr-md-4 mr-2 d-flex d-lg-none ml-auto">
          {renderSortControl()}
        </div>
        {/* filter option */}
        <div className="d-lg-none">
          <button
            type="button"
            className="btn"
            onClick={openSearchOptionModalHandler}
          >
            <i className="icon-equalizer"></i>
          </button>
        </div>
        <div className="d-none d-lg-flex align-items-center ml-auto search-control-include-options">
          <div className="card mr-3 mb-0">
            <div className="card-body">
              <label className="search-include-label mb-0 d-flex align-items-center text-secondary with-no-font-weight" htmlFor="flexCheckDefault">
                <input
                  checked={!props.excludeUserPages}
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
                  checked={!props.excludeTrashPages}
                />
                {t('Include Subordinated Target Page', { target: '/trash' })}
              </label>
            </div>
          </div>
        </div>
      </div>
      {rednerSearchOptionModal()}
    </div>
  );
};


export default SearchControl;
