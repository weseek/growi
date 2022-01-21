import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../client/services/AppContainer';
import SearchOptionModal from './SearchOptionModal';
import SortControl from './SortControl';
import {
  SORT_AXIS, SORT_ORDER,
} from '../../interfaces/search';

type Props = {
  searchingKeyword: string,
  sort: SORT_AXIS,
  order: SORT_ORDER,
  appContainer: AppContainer,
  excludeUserPages: boolean,
  excludeTrashPages: boolean,
  onSearchInvoked: (data: {keyword: string}) => Promise<void>
  onExcludeUserPagesSwitched?: () => void,
  onExcludeTrashPagesSwitched?: () => void,
  onChangeSortInvoked?: (nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => void,
  actionToPageGroup: React.ReactNode,
  searchForm: React.ReactNode,
  includeSpecificPath?: React.ReactNode,
  sortControl?: React.ReactNode,
}

const SearchControl: FC <Props> = (props: Props) => {

  const [isFileterOptionModalShown, setIsFileterOptionModalShown] = useState(false);
  const { t } = useTranslation('');
  const { actionToPageGroup } = props;

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


  return (
    <div className="position-sticky fixed-top shadow-sm">
      <div className="grw-search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          {props.searchForm}
        </div>

        {/* sort option: show when screen is larger than lg */}
        <div className="mr-4 d-lg-flex d-none">
          {props.sortControl}
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="search-control d-flex align-items-center py-md-2 py-3 px-md-4 px-3 border-bottom border-gray">
        <div className="d-flex pl-md-2">
          {actionToPageGroup}
        </div>
        {/* sort option: show when screen is smaller than lg */}
        <div className="mr-md-4 mr-2 d-flex d-lg-none ml-auto">
          {props.sortControl}
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
        {props.includeSpecificPath}
      </div>
      {rednerSearchOptionModal()}
    </div>
  );
};


export default SearchControl;
