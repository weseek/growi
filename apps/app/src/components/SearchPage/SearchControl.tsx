import React, {
  useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { SORT_AXIS, SORT_ORDER } from '~/interfaces/search';
import { ISearchConditions, ISearchConfigurations } from '~/stores/search';

import SearchForm from '../SearchForm';

import SearchOptionModal from './SearchOptionModal';
import SortControl from './SortControl';

type Props = {
  isSearchServiceReachable: boolean,
  isEnableSort: boolean,
  isEnableFilter: boolean,
  initialSearchConditions: Partial<ISearchConditions>,

  onSearchInvoked: (keyword: string, configurations: Partial<ISearchConfigurations>) => void,

  allControl: React.ReactNode,
}

const SearchControl = React.memo((props: Props): JSX.Element => {

  const {
    isSearchServiceReachable,
    isEnableSort,
    isEnableFilter,
    initialSearchConditions,
    onSearchInvoked,
    allControl,
  } = props;

  const [keyword, setKeyword] = useState(initialSearchConditions.keyword ?? '');
  const [sort, setSort] = useState<SORT_AXIS>(initialSearchConditions.sort ?? SORT_AXIS.RELATION_SCORE);
  const [order, setOrder] = useState<SORT_ORDER>(initialSearchConditions.order ?? SORT_ORDER.DESC);
  const [includeUserPages, setIncludeUserPages] = useState(initialSearchConditions.includeUserPages ?? false);
  const [includeTrashPages, setIncludeTrashPages] = useState(initialSearchConditions.includeTrashPages ?? false);
  const [isFileterOptionModalShown, setIsFileterOptionModalShown] = useState(false);

  const { t } = useTranslation('');

  const invokeSearch = useCallback(() => {
    if (onSearchInvoked == null) {
      return;
    }

    onSearchInvoked(keyword, {
      sort, order, includeUserPages, includeTrashPages,
    });
  }, [keyword, sort, order, includeTrashPages, includeUserPages, onSearchInvoked]);

  const searchFormSubmittedHandler = useCallback((input: string) => {
    setKeyword(input);
  }, []);

  const changeSortHandler = useCallback((nextSort: SORT_AXIS, nextOrder: SORT_ORDER) => {
    setSort(nextSort);
    setOrder(nextOrder);
  }, []);

  useEffect(() => {
    invokeSearch();
  }, [invokeSearch]);

  useEffect(() => {
    setKeyword(initialSearchConditions.keyword ?? '');
  }, [initialSearchConditions.keyword]);

  return (
    <div className="shadow-sm">
      <div className="grw-search-page-nav d-flex py-3 align-items-center">
        <div className="flex-grow-1 mx-4">
          <SearchForm
            isSearchServiceReachable={isSearchServiceReachable}
            keywordOnInit={keyword}
            disableIncrementalSearch
            onSubmit={searchFormSubmittedHandler}
          />
        </div>

        {/* sort option: show when screen is larger than lg */}
        {isEnableSort && (
          <div className="me-4 d-lg-flex d-none">
            <SortControl
              sort={sort}
              order={order}
              onChange={changeSortHandler}
            />
          </div>
        )}
      </div>
      {/* TODO: replace the following elements deleteAll button , relevance button and include specificPath button component */}
      <div className="search-control d-flex align-items-center py-md-2 py-3 px-md-4 px-3 border-bottom border-gray">
        <div className="d-flex">
          {allControl}
        </div>
        {/* sort option: show when screen is smaller than lg */}
        {isEnableSort && (
          <div className="me-md-4 me-2 d-flex d-lg-none ms-auto">
            <SortControl
              sort={sort}
              order={order}
              onChange={changeSortHandler}
            />
          </div>
        )}
        {/* filter option */}
        {isEnableFilter && (
          <>
            <div className="d-lg-none">
              <button
                type="button"
                className="btn"
                onClick={() => setIsFileterOptionModalShown(true)}
              >
                <i className="icon-equalizer"></i>
              </button>
            </div>
            <div className="d-none d-lg-flex align-items-center ms-auto search-control-include-options">
              <div className="border rounded px-2 py-1 me-3">
                <div className="form-check form-check-succsess">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    id="flexCheckDefault"
                    defaultChecked={includeUserPages}
                    onChange={e => setIncludeUserPages(e.target.checked)}
                  />
                  <label
                    className="form-label form-check-label mb-0 d-flex align-items-center text-secondary with-no-font-weight"
                    htmlFor="flexCheckDefault"
                  >
                    {t('Include Subordinated Target Page', { target: '/user' })}
                  </label>
                </div>
              </div>
              <div className="border rounded px-2 py-1">
                <div className="form-check form-check-succsess">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    id="flexCheckChecked"
                    checked={includeTrashPages}
                    onChange={e => setIncludeTrashPages(e.target.checked)}
                  />
                  <label
                    className="form-label form-check-label d-flex align-items-center text-secondary with-no-font-weight"
                    htmlFor="flexCheckChecked"
                  >
                    {t('Include Subordinated Target Page', { target: '/trash' })}
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <SearchOptionModal
        isOpen={isFileterOptionModalShown || false}
        onClose={() => setIsFileterOptionModalShown(false)}
        includeUserPages={includeUserPages}
        includeTrashPages={includeTrashPages}
        onIncludeUserPagesSwitched={setIncludeUserPages}
        onIncludeTrashPagesSwitched={setIncludeTrashPages}
      />

    </div>
  );
});

SearchControl.displayName = 'SearchControl';

export default SearchControl;
