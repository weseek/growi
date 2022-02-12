import React, {
  useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { IFormattedSearchResult } from '~/interfaces/search';

import { ISearchConditions, ISearchConfigurations, useSWRxFullTextSearch } from '~/stores/search';
import PaginationWrapper from './PaginationWrapper';
import { OperateAllControl, useSelectAll } from './SearchPage/OperateAllControl';
import SearchControl from './SearchPage/SearchControl';

import SearchPageBase from './SearchPage2/SearchPageBase';


// TODO: replace with "customize:showPageLimitationS"
const INITIAL_PAGIONG_SIZE = 20;


/**
 * SearchResultListHead
 */

type SearchResultListHeadProps = {
  searchResult: IFormattedSearchResult,
  searchingKeyword: string,
  offset: number,
  pagingSize: number,
  onPagingSizeChanged: (size: number) => void,
}

const SearchResultListHead = React.memo((props: SearchResultListHeadProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    searchResult, searchingKeyword, offset, pagingSize,
    onPagingSizeChanged,
  } = props;

  const { took, total, hitsCount } = searchResult.meta;
  const leftNum = offset + 1;
  const rightNum = offset + hitsCount;

  return (
    <div className="d-flex align-items-center justify-content-between">
      <div className="text-nowrap">
        {t('search_result.result_meta')}
        <span className="search-result-keyword">{`"${searchingKeyword}"`}</span>
        <span className="ml-3">{`${leftNum}-${rightNum}`} / {total}</span>
        <span className="ml-3 text-muted">({took}ms)</span>
      </div>
      <div className="input-group search-result-select-group ml-4 d-lg-flex d-none">
        <div className="input-group-prepend">
          <label className="input-group-text text-muted" htmlFor="inputGroupSelect01">{t('search_result.number_of_list_to_display')}</label>
        </div>
        <select
          defaultValue={pagingSize}
          className="custom-select"
          id="inputGroupSelect01"
          onChange={e => onPagingSizeChanged(Number(e.target.value))}
        >
          {[20, 50, 100, 200].map((limit) => {
            return <option key={limit} value={limit}>{limit} {t('search_result.page_number_unit')}</option>;
          })}
        </select>
      </div>
    </div>
  );
});


/**
 * SearchPage
 */

type Props = {
  appContainer: AppContainer,
}

export const SearchPage = (props: Props): JSX.Element => {

  const {
    appContainer,
  } = props;

  const [keyword, setKeyword] = useState<string>('sand');
  const [configurationsByControl, setConfigurationsByControl] = useState<Partial<ISearchConfigurations>>({
  });
  const [configurationsByPagination, setConfigurationsByPagination] = useState<Partial<ISearchConfigurations>>({
    limit: INITIAL_PAGIONG_SIZE,
  });

  const { data, conditions } = useSWRxFullTextSearch(keyword, {
    limit: INITIAL_PAGIONG_SIZE,
    ...configurationsByControl,
    ...configurationsByPagination,
  });

  const {
    isIndeterminate: isSelectedPageCountIndeterminate,
    setSelectedCount: setSelectedPagesCount,
  } = useSelectAll(data?.meta.hitsCount);

  const searchInvokedHandler = useCallback((_keyword: string, newConfigurations: Partial<ISearchConfigurations>) => {
    setKeyword(_keyword);
    setConfigurationsByControl(newConfigurations);
  }, []);

  const pagingNumberChangedHandler = useCallback((activePage: number) => {
    const currentLimit = configurationsByPagination.limit ?? INITIAL_PAGIONG_SIZE;
    setConfigurationsByPagination({
      ...configurationsByPagination,
      offset: (activePage - 1) * currentLimit,
    });
  }, [configurationsByPagination]);

  const initialSearchConditions: Partial<ISearchConditions> = useMemo(() => {
    return {
      keyword: 'sand', // TODO get keyword from GET params
      limit: INITIAL_PAGIONG_SIZE,
    };
  }, []);

  const hitsCount = data?.meta.hitsCount;
  const { offset, limit } = conditions;

  const deleteAllControl = useMemo(() => {
    const disableSelectAllbutton = hitsCount === 0;

    return (
      <OperateAllControl
        isSelectAllCheckboxDisabled={disableSelectAllbutton}
        isSelectedPageCountIndeterminate={isSelectedPageCountIndeterminate}
        onClickDeleteAllButton={() => null /* TODO implement */}
        onClickSelectAllCheckbox={() => null /* TODO implement */}
      />
    );
  }, [hitsCount, isSelectedPageCountIndeterminate]);

  const searchControl = useMemo(() => {
    return (
      <SearchControl
        initialSearchConditions={initialSearchConditions}
        onSearchInvoked={searchInvokedHandler}
        deleteAllControl={deleteAllControl}
      >
      </SearchControl>
    );
  }, [deleteAllControl, initialSearchConditions, searchInvokedHandler]);

  const searchResultListHead = useMemo(() => {
    if (data == null) {
      return <></>;
    }
    return (
      <SearchResultListHead
        searchResult={data}
        searchingKeyword={keyword}
        offset={offset}
        pagingSize={limit}
        onPagingSizeChanged={() => {}}
      />
    );
  }, [data, keyword, limit, offset]);

  const searchPager = useMemo(() => {
    // when pager is not needed
    if (data == null || data.meta.hitsCount === data.meta.total) {
      return <></>;
    }

    const { total } = data.meta;
    const { offset, limit } = conditions;

    return (
      <PaginationWrapper
        activePage={Math.floor(offset / limit) + 1}
        totalItemsCount={total}
        pagingLimit={configurationsByPagination?.limit}
        changePage={pagingNumberChangedHandler}
      />
    );
  }, [conditions, configurationsByPagination?.limit, data, pagingNumberChangedHandler]);

  return (
    <SearchPageBase
      appContainer={appContainer}
      pages={data?.data}
      onSelectedPagesByCheckboxesChanged={setSelectedPagesCount}
      // Components
      searchControl={searchControl}
      searchResultListHead={searchResultListHead}
      searchPager={searchPager}
    />
  );
};
