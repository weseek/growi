import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CheckboxType, SORT_AXIS, SORT_ORDER } from '~/interfaces/search';
import { ISearchConditions, ISearchConfigurations } from '~/stores/search';

import SearchPageForm from './SearchPageForm';
import DeleteSelectedPageGroup from './DeleteSelectedPageGroup';
import SearchOptionModal from './SearchOptionModal';
import SortControl from './SortControl';

type Props = {
  selectAllCheckboxType: CheckboxType,
  disableSelectAllbutton?: boolean,
  initialSearchConditions?: Partial<ISearchConditions>,
  onClickDeleteAllButton?: () => void
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
  onSearchInvoked?: (keyword: string, configurations: Partial<ISearchConfigurations>) => void,
}

const SearchControl: FC <Props> = (props: Props) => {

  const {
    disableSelectAllbutton,
    initialSearchConditions,
    onSearchInvoked,
  } = props;

  const [keyword, setKeyword] = useState(initialSearchConditions?.keyword ?? '');
  const [sort, setSort] = useState<SORT_AXIS>(initialSearchConditions?.sort ?? SORT_AXIS.RELATION_SCORE);
  const [order, setOrder] = useState<SORT_ORDER>(initialSearchConditions?.order ?? SORT_ORDER.DESC);
  const [includeUserPages, setIncludeUserPages] = useState(true);
  const [includeTrashPages, setIncludeTrashPages] = useState(true);
  const [isFileterOptionModalShown, setIsFileterOptionModalShown] = useState(false);

  const { t } = useTranslation('');

  const invokeSearch = useCallback(() => {
    if (onSearchInvoked == null) {
      return;
    }

    onSearchInvoked(keyword, {
      sort, order, includeUserPages, includeTrashPages,
    });
  }, [includeTrashPages, includeUserPages, keyword, onSearchInvoked, order, sort]);

  const searchFormChangedHandler = useCallback((keyword: string) => {
    setKeyword(keyword);

    // invoke search
    invokeSearch();
  }, [invokeSearch]);

  const changeSortHandler = useCallback((nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => {
    setSort(nextSort);
    setOrder(nextOrder);

    // invoke search
    invokeSearch();
  }, [invokeSearch]);

  const clickSearchBySearchOptionModalHandler = useCallback(() => {
    // invoke search
    invokeSearch();
  }, [invokeSearch]);

  return (
    <div className="position-sticky fixed-top shadow-sm">
      <div className="grw-search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          <SearchPageForm
            keyword={keyword}
            onSearchFormChanged={searchFormChangedHandler}
          />
        </div>

        {/* sort option: show when screen is larger than lg */}
        <div className="mr-4 d-lg-flex d-none">
          <SortControl
            sort={sort}
            order={order}
            onChange={changeSortHandler}
          />
        </div>
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="search-control d-flex align-items-center py-md-2 py-3 px-md-4 px-3 border-bottom border-gray">
        <div className="d-flex pl-md-2">
          {/* Todo: design will be fixed in #80324. Function will be implemented in #77525 */}
          <DeleteSelectedPageGroup
            isSelectAllCheckboxDisabled={disableSelectAllbutton}
            selectAllCheckboxType={props.selectAllCheckboxType}
            onClickDeleteAllButton={props.onClickDeleteAllButton}
            onClickSelectAllCheckbox={props.onClickSelectAllCheckbox}
          />
        </div>
        {/* sort option: show when screen is smaller than lg */}
        <div className="mr-md-4 mr-2 d-flex d-lg-none ml-auto">
          <SortControl
            sort={sort}
            order={order}
            onChange={changeSortHandler}
          />
        </div>
        {/* filter option */}
        <div className="d-lg-none">
          <button
            type="button"
            className="btn"
            onClick={() => setIsFileterOptionModalShown(true)}
          >
            <i className="icon-equalizer"></i>
          </button>
        </div>
        <div className="d-none d-lg-flex align-items-center ml-auto search-control-include-options">
          <div className="card mr-3 mb-0">
            <div className="card-body">
              <label className="search-include-label mb-0 d-flex align-items-center text-secondary with-no-font-weight" htmlFor="flexCheckDefault">
                <input
                  className="mr-2"
                  type="checkbox"
                  id="flexCheckDefault"
                  onChange={e => setIncludeUserPages(e.target.checked)}
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
                  onChange={e => setIncludeTrashPages(e.target.checked)}
                />
                {t('Include Subordinated Target Page', { target: '/trash' })}
              </label>
            </div>
          </div>
        </div>
      </div>

      <SearchOptionModal
        isOpen={isFileterOptionModalShown || false}
        onClose={() => setIsFileterOptionModalShown(false)}
        includeUserPages={includeUserPages}
        includeTrashPages={includeTrashPages}
        onClickSearch={clickSearchBySearchOptionModalHandler}
        onIncludeUserPagesSwitched={setIncludeUserPages}
        onIncludeTrashPagesSwitched={setIncludeTrashPages}
      />

    </div>
  );
};


export default SearchControl;
