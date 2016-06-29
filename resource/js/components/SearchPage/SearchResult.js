import React from 'react';

import Page from '../PageList/Page';
import SearchResultList from './SearchResultList';

// Search.SearchResult
export default class SearchResult extends React.Component {

  render() {

    const listView = this.props.pages.map((page) => {
      const pageId = "#" + page._id;
      return (
        <Page page={page} linkTo={pageId} key={page._id}>
          <div className="page-list-option">
            <a href={page.path}><i className="fa fa-arrow-circle-right" /></a>
          </div>
        </Page>
      );
    });

    /*
    UI あとで考える
    <span className="search-result-meta">Found: {this.props.searchResultMeta.total} pages with "{this.props.searchingKeyword}"</span>
    */
    return (
      <div className="content-main" id="content-main">
        <div className="search-result row" id="search-result">
          <div className="col-md-4 page-list search-result-list" id="search-result-list">
            <nav data-spy="affix"  data-offset-top="120">
              <ul className="page-list-ul nav">
                {listView}
              </ul>
            </nav>
          </div>
          <div className="col-md-8 search-result-content" id="search-result-content">
            <SearchResultList
              pages={this.props.pages}
              searchingKeyword={this.props.searchingKeyword}
              />
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
  searchResultMeta: {},
};

