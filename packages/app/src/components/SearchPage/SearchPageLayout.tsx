import React, { FC } from 'react';

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
  const { SearchResultList, SearchControl, SearchResultContent } = props;
  return (
    <div className="content-main">
      <div className="search-result d-flex" id="search-result">
        <div className="page-list search-result-list pr-0" id="search-result-list">
          <nav><SearchControl></SearchControl></nav>
          <div className="d-flex align-items-start justify-content-between mt-1">
            <div className="search-result-meta">
              <i className="icon-magnifier" /> Found {props.searchResultMeta.total} pages with &quot;{props.searchingKeyword}&quot;
            </div>
          </div>

          <div className="page-list">
            <ul className="page-list-ul page-list-ul-flat nav nav-pills"><SearchResultList></SearchResultList></ul>
          </div>
        </div>
        <div className="w-50 flex-grow-1 d-none d-lg-block search-result-content">
          <SearchResultContent></SearchResultContent>
        </div>
      </div>
    </div>
  );
};


export default SearchPageLayout;
