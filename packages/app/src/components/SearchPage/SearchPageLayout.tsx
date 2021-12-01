import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type SearchResultMeta = {
  took?: number,
  total?: number,
  results?: number
}

type Props = {
  SearchControl: React.FunctionComponent,
  SearchResultList: React.FunctionComponent,
  SearchResultContent: React.FunctionComponent,
  searchResultMeta: SearchResultMeta,
  searchingKeyword: string,
  pagingLimit: number,
  activePage: number,
  onPagingLimitChanged: (limit: number) => void
}

const SearchPageLayout: FC<Props> = (props: Props) => {
  const { t } = useTranslation('');
  const {
    SearchResultList, SearchControl, SearchResultContent, searchResultMeta, searchingKeyword, pagingLimit, activePage,
  } = props;

  const renderShowingPageCountInfo = () => {
    if (searchResultMeta.total == null || searchResultMeta.total === 0) return;
    const leftNum = pagingLimit * (activePage - 1) + 1;
    const rightNum = (leftNum - 1) + (searchResultMeta.results || 0);
    return <span className="ml-3">{`${leftNum}-${rightNum}`} / {searchResultMeta.total || 0}</span>;
  };

  return (
    <div className="content-main">
      <div className="search-result d-flex" id="search-result">
        <div className="flex-grow-1 flex-basis-0 page-list border boder-gray search-result-list" id="search-result-list">

          <SearchControl></SearchControl>
          <div className="d-flex align-items-center justify-content-between my-3 ml-4">
            <div className="search-result-meta text-nowrap">
              <span className="font-weight-light">{t('search_result.result_meta')} </span>
              <span className="h5">{`"${searchingKeyword}"`}</span>
              {/* Todo: replace "1-10" to the appropriate value */}
              {renderShowingPageCountInfo()}
            </div>
            <div className="input-group search-result-select-group ml-4">
              <div className="input-group-prepend">
                <label className="input-group-text text-secondary" htmlFor="inputGroupSelect01">{t('search_result.number_of_list_to_display')}</label>
              </div>
              <select className="custom-select" id="inputGroupSelect01" onChange={(e) => { props.onPagingLimitChanged(Number(e.target.value)) }}>
                {[20, 50, 100, 200].map((limit) => {
                  return <option selected={limit === props.pagingLimit} value={limit}>{limit}{t('search_result.page_number_unit')}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="page-list">
            <ul className="page-list-ul page-list-ul-flat nav nav-pills"><SearchResultList></SearchResultList></ul>
          </div>
        </div>
        <div className="flex-grow-1 flex-basis-0 d-none d-lg-block search-result-content">
          <SearchResultContent></SearchResultContent>
        </div>
      </div>
    </div>
  );
};


export default SearchPageLayout;
