import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import DeleteSelectedPageGroup from './DeleteSelectedPageGroup';
import SearchOptionModal from './SearchOptionModal';
import SortControl from './SortControl';
import { CheckboxType, SORT_AXIS, SORT_ORDER } from '../../interfaces/search';

type Props = {
  searchingKeyword: string,
  sort: SORT_AXIS,
  order: SORT_ORDER,
  appContainer: AppContainer,
  searchResultCount: number,
  selectAllCheckboxType: CheckboxType,
  onClickDeleteAllButton?: () => void
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
  excludeUserPages: boolean,
  excludeTrashPages: boolean,
  onSearchInvoked: (data: {keyword: string}) => boolean,
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

  return (
    <div className="position-sticky fixed-top">
      <div className="search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          <SearchPageFormTypeAny
            keyword={props.searchingKeyword}
            appContainer={props.appContainer}
            onSearchFormChanged={props.onSearchInvoked}
          />
        </div>
        <div className="mr-4 d-flex">
          <SortControl
            sort={props.sort}
            order={props.order}
            onChangeSortInvoked={onChangeSortInvoked}
          />
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="search-control d-flex align-items-center py-2 border-bottom border-gray">
        <div className="d-flex mr-auto ml-4">
          {/* Todo: design will be fixed in #80324. Function will be implemented in #77525 */}
          <DeleteSelectedPageGroup
            isSelectAllCheckboxDisabled={searchResultCount === 0}
            selectAllCheckboxType={props.selectAllCheckboxType}
            onClickDeleteAllButton={props.onClickDeleteAllButton}
            onClickSelectAllCheckbox={props.onClickSelectAllCheckbox}
          />
        </div>
        {/** filter option */}
        <div className="d-lg-none mr-4">
          <button
            type="button"
            className="btn"
            onClick={openSearchOptionModalHandler}
          >
            <i className="icon-equalizer"></i>
          </button>
        </div>
        <div className="d-none d-lg-flex align-items-center mr-4">
          <div className="border border-gray mr-3">
            {/* By defualt font weight is 700 (_override-bootstrap.scss) */}
            <label className="px-3 py-2 mb-0 d-flex align-items-center text-secondary font-weight-light" htmlFor="flexCheckDefault">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckDefault"
                onClick={switchExcludeUserPagesHandler}
              />
              {t('Include Subordinated Target Page', { target: '/user' })}
            </label>
          </div>
          <div className="border border-gray">
            {/* By defualt font weight is 700 (_override-bootstrap.scss) */}
            <label className="px-3 py-2 mb-0 d-flex align-items-center text-secondary font-weight-light" htmlFor="flexCheckChecked">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckChecked"
                onClick={switchExcludeTrashPagesHandler}
              />
              {t('Include Subordinated Target Page', { target: '/trash' })}
            </label>
          </div>
        </div>
      </div>
      {rednerSearchOptionModal()}
    </div>
  );
};


export default SearchControl;
