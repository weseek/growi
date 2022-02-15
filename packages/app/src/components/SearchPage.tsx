import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { parse as parseQuerystring } from 'querystring';

import AppContainer from '~/client/services/AppContainer';
import { IFormattedSearchResult } from '~/interfaces/search';
import { ISelectableAll, ISelectableAndIndeterminatable } from '~/client/interfaces/selectable-all';
import { useIsSearchServiceConfigured, useIsSearchServiceReachable } from '~/stores/context';
import { ISearchConditions, ISearchConfigurations, useSWRxFullTextSearch } from '~/stores/search';

import PaginationWrapper from './PaginationWrapper';
import { OperateAllControl } from './SearchPage/OperateAllControl';
import SearchControl from './SearchPage/SearchControl';

import { SearchPageBase } from './SearchPage2/SearchPageBase';


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
        { took != null && (
          <span className="ml-3 text-muted">({took}ms)</span>
        ) }
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

const getParsedUrlQuery = () => {
  const search = window.location.search || '?';
  return parseQuerystring(search.slice(1)); // remove heading '?' and parse
};

type Props = {
  appContainer: AppContainer,
}

export const SearchPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    appContainer,
  } = props;

  // parse URL Query
  const parsedQueries = getParsedUrlQuery().q;
  const initQ = (Array.isArray(parsedQueries) ? parsedQueries.join(' ') : parsedQueries) ?? '';

  const [keyword, setKeyword] = useState<string>(initQ);
  const [configurationsByControl, setConfigurationsByControl] = useState<Partial<ISearchConfigurations>>({});
  const [configurationsByPagination, setConfigurationsByPagination] = useState<Partial<ISearchConfigurations>>({
    limit: INITIAL_PAGIONG_SIZE,
  });

  const selectAllControlRef = useRef<ISelectableAndIndeterminatable|null>(null);
  const searchPageBaseRef = useRef<ISelectableAll|null>(null);

  const { data: isSearchServiceConfigured } = useIsSearchServiceConfigured();
  const { data: isSearchServiceReachable } = useIsSearchServiceReachable();

  const { data, conditions } = useSWRxFullTextSearch(keyword, {
    limit: INITIAL_PAGIONG_SIZE,
    ...configurationsByControl,
    ...configurationsByPagination,
  });

  const searchInvokedHandler = useCallback((_keyword: string, newConfigurations: Partial<ISearchConfigurations>) => {
    setKeyword(_keyword);
    setConfigurationsByControl(newConfigurations);
  }, []);

  const selectAllCheckboxChangedHandler = useCallback((isChecked: boolean) => {
    const instance = searchPageBaseRef.current;

    if (instance == null) {
      return;
    }

    if (isChecked) {
      instance.selectAll();
    }
    else {
      instance.deselectAll();
    }
  }, []);

  const selectedPagesByCheckboxesChangedHandler = useCallback((selectedCount: number, totalCount: number) => {
    const instance = selectAllControlRef.current;

    if (instance == null) {
      return;
    }

    if (selectedCount === 0) {
      instance.deselect();
    }
    else if (selectedCount === totalCount) {
      instance.select();
    }
    else {
      instance.setIndeterminate();
    }
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
      keyword: initQ,
      limit: INITIAL_PAGIONG_SIZE,
    };
  }, [initQ]);

  // push state
  useEffect(() => {
    const newUrl = new URL('/_search', 'http://example.com');
    newUrl.searchParams.append('q', keyword);
    window.history.pushState('', `Search - ${keyword}`, `${newUrl.pathname}${newUrl.search}`);
  }, [keyword]);
  const hitsCount = data?.meta.hitsCount;

  const { offset, limit } = conditions;

  const deleteAllControl = useMemo(() => {
    const isDisabled = hitsCount === 0;

    return (
      <OperateAllControl
        ref={selectAllControlRef}
        isCheckboxDisabled={isDisabled}
        onCheckboxChanged={selectAllCheckboxChangedHandler}
      >
        <button
          type="button"
          className="btn btn-outline-danger border-0 px-2"
          disabled={isDisabled}
          onClick={() => null /* TODO implement */}
        >
          <i className="icon-fw icon-trash"></i>
          {t('search_result.delete_all_selected_page')}
        </button>
      </OperateAllControl>
    );
  }, [hitsCount, selectAllCheckboxChangedHandler, t]);

  const searchControl = useMemo(() => {
    if (!isSearchServiceReachable) {
      return <></>;
    }
    return (
      <SearchControl
        isSearchServiceReachable={isSearchServiceReachable}
        initialSearchConditions={initialSearchConditions}
        onSearchInvoked={searchInvokedHandler}
        deleteAllControl={deleteAllControl}
      >
      </SearchControl>
    );
  }, [deleteAllControl, initialSearchConditions, isSearchServiceReachable, searchInvokedHandler]);

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

  if (!isSearchServiceConfigured) {
    return (
      <div className="grw-container-convertible">
        <div className="row mt-5">
          <div className="col text-muted">
            <h1>Search service is not configured in this system.</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isSearchServiceReachable) {
    return (
      <div className="grw-container-convertible">
        <div className="row mt-5">
          <div className="col text-muted">
            <h1>Search service occures errors. Please contact to administrators of this system.</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SearchPageBase
      ref={searchPageBaseRef}
      appContainer={appContainer}
      pages={data?.data}
      onSelectedPagesByCheckboxesChanged={selectedPagesByCheckboxesChangedHandler}
      // Components
      searchControl={searchControl}
      searchResultListHead={searchResultListHead}
      searchPager={searchPager}
    />
  );
};
