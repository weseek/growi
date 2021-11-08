import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

type SearchResultMeta = {
  took : number,
  total : number,
  results: number
}

type Props = {
  SearchControl: React.FunctionComponent,
  SearchResultList: React.FunctionComponent,
  SearchResultContent: React.FunctionComponent,
  searchResultMeta: SearchResultMeta,
  searchingKeyword: string
}

const SearchPageLayout: FC<Props> = (props: Props) => {
  const { t } = useTranslation('');
  const {
    SearchResultList, SearchControl, SearchResultContent, searchResultMeta, searchingKeyword,
  } = props;

  return (
    <div className="content-main">
      <div className="search-result row" id="search-result">
        <div className="col-lg-6  page-list search-result-list pr-0" id="search-result-list">
          <nav><SearchControl></SearchControl></nav>
          <div className="d-flex align-items-start justify-content-between mt-1">
            <div className="search-result-meta">
              <span className="font-weight-light">{t('search_result.result_meta')} </span>
              <span className="h5">{`"${searchingKeyword}"`}</span>
              {/* Todo: replace "1-10" to the appropriate value */}
              <span className="ml-3">1-10 / {searchResultMeta.total || 0}</span>
            </div>
          </div>

          <div className="page-list">
            <ul className="page-list-ul page-list-ul-flat nav nav-pills"><SearchResultList></SearchResultList></ul>
          </div>
        </div>
        <div className="col-lg-6 d-none d-lg-block search-result-content">
          <SearchResultContent></SearchResultContent>
        </div>
      </div>
    </div>
  );
};


export default SearchPageLayout;
