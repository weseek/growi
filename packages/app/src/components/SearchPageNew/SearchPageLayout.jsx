import React from 'react';
import PropTypes from 'prop-types';
import SearchControl from './SearchControl';
import SearchResultList from './SearchResultList';

// TODO: SearchPageNew to SearchPage
// deletion functionality

// create render function that will prepare Components wuth props.s
const SearchPageLayout = (props) => {
  return (
    <div className="content-main">
      <div className="search-result row" id="search-result">
        <nav>
          {props.SearchControlComponent}
        </nav>
        <div className="d-flex align-items-start justify-content-between mt-1">
          <div className="search-result-meta">
            <i className="icon-magnifier" /> Found {} pages with &quot;{}&quot;
          </div>
          <div className="text-nowrap">
            {}
            {}
          </div>
        </div>

        <div className="page-list">
          <ul className="page-list-ul page-list-ul-flat nav nav-pills">
            {props.SearchResultList}
          </ul>
        </div>
      </div>

      <div className="col-lg-6 search-result-content">
        {props.SearchResultContent}
      </div>
      {/* DeletePageListModal */}
    </div>
  );
};

SearchPageLayout.propTypes = {
  SearchControlComponent: PropTypes.instanceOf(SearchControl).isRequired,
  SearchResultList: PropTypes.element.instanceOf(SearchResultList).isRequired,
  SearchResultContent: PropTypes.element,
};

export default SearchPageLayout;
