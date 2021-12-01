import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchPageForm from './SearchPageForm';
import AppContainer from '../../client/services/AppContainer';
import DeleteSelectedPageGroup from './DeleteSelectedPageGroup';
import SearchOptionModal from './SearchOptionModal';
import { CheckboxType } from '../../interfaces/search';

type Props = {
  searchingKeyword: string,
  sort: string,
  order: string,
  appContainer: AppContainer,
  excludeUserPages: boolean,
  excludeTrashPages: boolean,
  onSearchInvoked: (data: {keyword: string}) => boolean,
  onExcludeUserPagesSwitched?: () => void,
  onExcludeTrashPagesSwitched?: () => void,
  onChangeSortInvoked?: (nextSort: string, nextOrder: string) => void,
}

const SearchControl: FC <Props> = (props: Props) => {

  const [isFileterOptionModalShown, setIsFileterOptionModalShown] = useState(false);
  // Temporaly workaround for lint error
  // later needs to be fixed: SearchControl to typescript componet
  const SearchPageFormTypeAny : any = SearchPageForm;
  const { t } = useTranslation('');

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
      const getNextSort = (sort) => {
        switch (sort) {
          case '_score':
            return 'updated_at';
          case 'updated_at':
            return 'created_at';
          case 'created_at':
          default:
            return '_score';
        }
      };
      const nextSort = props.order === 'desc' ? props.sort : getNextSort(props.sort);
      const nextOrder = nextSort === props.sort ? 'asc' : 'desc';
      props.onChangeSortInvoked(nextSort, nextOrder);
    }
  };

  const onDeleteSelectedPageHandler = () => {
    console.log('onDeleteSelectedPageHandler is called');
    // TODO: implement this function to delete selected pages.
    // https://estoc.weseek.co.jp/redmine/issues/77525
  };

  const onCheckAllPagesInvoked = (nextCheckboxState:CheckboxType) => {
    console.log(`onCheckAllPagesInvoked is called with arg ${nextCheckboxState}`);
    // Todo: set the checkboxState, isChecked, and indeterminate value of checkbox element according to the passed argument
    // https://estoc.weseek.co.jp/redmine/issues/77525

    // setting checkbox to indeterminate is required to use of useRef to access checkbox element.
    // ref: https://getbootstrap.com/docs/4.5/components/forms/#checkboxes
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
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="d-flex align-items-center py-3 border-bottom border-gray">
        <div className="d-flex mr-auto ml-3">
          {/* Todo: design will be fixed in #80324. Function will be implemented in #77525 */}
          <DeleteSelectedPageGroup
            checkboxState={'' || CheckboxType.NONE_CHECKED} // Todo: change the left value to appropriate value
            onClickInvoked={onDeleteSelectedPageHandler}
            onCheckInvoked={onCheckAllPagesInvoked}
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
