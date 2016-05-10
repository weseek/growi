import React from 'react';

// Search.SearchResult
export default class SearchResult extends React.Component {

  render() {


    return (
      <div className="content-main" id="content-main">
        <div className="search-result row" id="search-result">
          <div className="col-md-3 page-list search-result-list" id="search-result-list">
          row
          </div>
          <div className="col-md-9 search-result-content" id="search-result-content">
          content
          </div>
        </div>
      </div>
    );
  }
}

SearchResult.propTypes = {
  searchedPages: React.PropTypes.array.isRequired,
  searchingKeyword: React.PropTypes.string.isRequired,
};
SearchResult.defaultProps = {
  searchedPages: [],
  searchingKeyword: '',
};

