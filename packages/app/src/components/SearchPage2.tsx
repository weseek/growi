import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { CheckboxType, IFormattedSearchResult } from '~/interfaces/search';

import { ISearchConditions, ISearchConfigurations, useSWRxFullTextSearch } from '~/stores/search';
import PaginationWrapper from './PaginationWrapper';
import SearchControl from './SearchPage/SearchControl';

import SearchPageBase from './SearchPage2/SearchPageBase';


// TODO: replace with "customize:showPageLimitationS"
const INITIAL_PAGIONG_SIZE = 20;


type SearchResultListHeadProps = {
  searchResult: IFormattedSearchResult,
  searchingKeyword: string,
  offset: number,
  pagingSize: number,
  onPagingSizeChanged: (size: number) => void,
}

const SearchResultListHead = (props: SearchResultListHeadProps): JSX.Element => {
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
};

type Props = {
  appContainer: AppContainer,
}


export const SearchPage = (props: Props): JSX.Element => {

  const {
    appContainer,
  } = props;

  const [keyword, setKeyword] = useState<string>('sand');
  const [searchConfigurations, setSearchConfigurations] = useState<ISearchConfigurations>({
    limit: INITIAL_PAGIONG_SIZE,
  });
  const [selectedPagesCount, setSelectedPagesCount] = useState(0);

  const { data, conditions } = useSWRxFullTextSearch(keyword, searchConfigurations);

  const searchInvokedHandler = useCallback((_keyword: string, newConfigurations: Partial<ISearchConfigurations>) => {
    setKeyword(_keyword);
    setSearchConfigurations({
      ...searchConfigurations,
      ...newConfigurations,
    });
  }, [searchConfigurations]);

  const pagingNumberChangedHandler = useCallback((activePage: number) => {
    // TODO implement
  }, []);

  return (
    <SearchPageBase
      appContainer={appContainer}
      pages={data?.data}
      onSelectedPagesByCheckboxesChanged={setSelectedPagesCount}
      // Components
      SearchControl={() => {
        let disableSelectAllbutton = true;
        let selectAllCheckboxType = CheckboxType.NONE_CHECKED;

        // determine checkbox state
        if (data != null && data.data.length > 0) {
          disableSelectAllbutton = false;

          if (selectedPagesCount > 0) {
            selectAllCheckboxType = data.data.length === selectedPagesCount
              ? CheckboxType.ALL_CHECKED
              : CheckboxType.INDETERMINATE;
          }
        }

        const initialSearchConditions: Partial<ISearchConditions> = data === null
          ? { keyword: 'sand' } // TODO get keyword from GET params
          : { ...conditions };

        return (
          <SearchControl
            selectAllCheckboxType={selectAllCheckboxType}
            disableSelectAllbutton={disableSelectAllbutton}
            initialSearchConditions={initialSearchConditions}
            onClickDeleteAllButton={() => null /* TODO implement */}
            onClickSelectAllCheckbox={() => null /* TODO implement */}
            onSearchInvoked={searchInvokedHandler}
          />
        );
      }}
      SearchResultListHead={() => {
        if (data == null) {
          return <></>;
        }

        return (
          <SearchResultListHead
            searchResult={data}
            searchingKeyword={conditions.keyword}
            offset={conditions.offset}
            pagingSize={conditions.limit}
            onPagingSizeChanged={() => {}}
          />
        );
      }}
      SearchPager={() => {
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
            pagingLimit={searchConfigurations?.limit}
            changePage={pagingNumberChangedHandler}
          />
        );
      }}
    />
  );
};
