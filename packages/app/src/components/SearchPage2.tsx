import React from 'react';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { IFormattedSearchResult } from '~/interfaces/search';

import { useSWRxFullTextSearch } from '~/stores/search';

import SearchPageBase from './SearchPage2/SearchPageBase';


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

  const { data, conditions } = useSWRxFullTextSearch('sand', {
    limit: 20,
  });

  return (
    <SearchPageBase
      appContainer={appContainer}
      pages={data?.data}
      SearchControl={() => (
        <></>
      )}
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
    />
  );
};
