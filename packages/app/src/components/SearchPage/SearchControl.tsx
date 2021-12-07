import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import DeleteSelectedPageGroup from './DeleteSelectedPageGroup';
import SearchOptionModal from './SearchOptionModal';
import { CheckboxType, SORT_AXIS, SORT_ORDER } from '../../interfaces/search';


const { RELATION_SCORE, UPDATED_AT, CREATED_AT } = SORT_AXIS;
const { DESC, ASC } = SORT_ORDER;

type Props = {
  searchingKeyword: string,
  sort: SORT_AXIS,
  order: string,
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

  // TODO: imprement sort dropdown
  // refs: https://redmine.weseek.co.jp/issues/82513
  const onClickChangeSort = () => {
    if (props.onChangeSortInvoked != null) {
      const getNextSort = (sort: SORT_AXIS) => {
        switch (sort) {
          case RELATION_SCORE:
            return UPDATED_AT;
          case UPDATED_AT:
            return CREATED_AT;
          case CREATED_AT:
          default:
            return RELATION_SCORE;
        }
      };
      const nextSort = props.order === DESC ? props.sort : getNextSort(props.sort);
      const nextOrder = nextSort === props.sort ? ASC : DESC;
      props.onChangeSortInvoked(nextSort, nextOrder);
    }
  };

  const renderSortControlDropdown = () => {
    return (
      <>
        {Object.keys(SORT_AXIS).forEach((sortAxis) => {
          return <div>{SORT_AXIS[sortAxis]}</div>;
        })}
      </>
    );
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
    <>
      <div className="search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          <SearchPageFormTypeAny
            keyword={props.searchingKeyword}
            appContainer={props.appContainer}
            onSearchFormChanged={props.onSearchInvoked}
          />
        </div>
        <div className="mr-4 d-flex">
          {/*
            TODO: imprement sort dropdown
            refs: https://redmine.weseek.co.jp/issues/82513
          */}
          <button type="button" onClick={onClickChangeSort}>change sort</button>
          <p>sort:{props.sort}, order: {props.order}</p>
          {renderSortControlDropdown()}
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="d-flex align-items-center py-3 border-bottom border-gray">
        <div className="d-flex mr-auto ml-3">
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
        <div className="d-none d-lg-flex align-items-center mr-3">
          <div className="border border-gray mr-3">
            <label className="px-3 py-2 mb-0 d-flex align-items-center" htmlFor="flexCheckDefault">
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
            <label className="px-3 py-2 mb-0 d-flex align-items-center" htmlFor="flexCheckChecked">
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
    </>
  );
};


export default SearchControl;
