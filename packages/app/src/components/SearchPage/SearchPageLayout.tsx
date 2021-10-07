import React, { FC } from 'react';
import PropTypes from 'prop-types';

type SearchResultMeta = {
  took : number,
  total : number,
  results: number
}

type Props = {
  SearchControl:JSX.Element,
  SearchResultList: JSX.Element,
  SearchResultContent: JSX.Element,
  searchResultMeta: SearchResultMeta,
  searchingKeyword: string
}

const SearchPageLayout: FC<Props> = (props: Props) => {
  return (
    <div className="content-main">
      <div className="search-result row" id="search-result">
        <div className="col-lg-6 d-none d-lg-block page-list search-result-list pr-0" id="search-result-list">
          <nav>{props.SearchControl}</nav>
          <div className="d-flex align-items-start justify-content-between mt-1">
            <div className="search-result-meta">
              <i className="icon-magnifier" /> Found {props.searchResultMeta.total} pages with &quot;{props.searchingKeyword}&quot;
            </div>
          </div>

          <div className="page-list">
            <ul className="page-list-ul page-list-ul-flat nav nav-pills">{props.SearchResultList}</ul>
          </div>
        </div>
        <div className="col-lg-6 search-result-content">
          {props.SearchResultContent}
        </div>
      </div>
    </div>
  );
};

SearchPageLayout.propTypes = {
  SearchControl: PropTypes.element.isRequired,
  SearchResultList: PropTypes.element.isRequired,
  SearchResultContent: PropTypes.element.isRequired,
  // searchResultMeta: PropTypes.object.isRequired, // TODO fix lint error
  searchingKeyword: PropTypes.string.isRequired,
};

export default SearchPageLayout;
