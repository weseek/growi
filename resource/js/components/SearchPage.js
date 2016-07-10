// This is the root component for #search-page

import React from 'react';
import axios from 'axios'
import SearchForm from './SearchPage/SearchForm';
import SearchResult from './SearchPage/SearchResult';

export default class SearchPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      location: location,
      searchingKeyword: this.props.query.q || '',
      searchedKeyword: '',
      searchedPages: [],
      searchResultMeta: {},
      searchError: null,
    }

    this.search = this.search.bind(this);
    this.changeURL = this.changeURL.bind(this);
  }

  componentDidMount() {
    const keyword = this.state.searchingKeyword;
    if (keyword !== '')  {
      this.search({keyword});
    }
  }

  static getQueryByLocation(location) {
    let search = location.search || '';
    let query = {};

    search.replace(/^\?/, '').split('&').forEach(function(element) {
      let queryParts = element.split('=');
      query[queryParts[0]] = decodeURIComponent(queryParts[1]).replace(/\+/g, ' ');
    });

    return query;
  }

  changeURL(keyword, refreshHash) {
    let hash = location.hash || '';
    // TODO 整理する
    if (refreshHash || this.state.searchedKeyword !== '') {
        hash = '';
    }
    if (window.history && window.history.pushState){
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  }

  search(data) {
    const keyword = data.keyword;
    if (keyword === '') {
      this.setState({
        searchingKeyword: '',
        searchedPages: [],
        searchResultMeta: {},
        searchError: null,
      });

      return true;
    }

    this.setState({
      searchingKeyword: keyword,
    });

    axios.get('/_api/search', {params: {q: keyword}})
    .then((res) => {
      if (res.data.ok) {
        this.changeURL(keyword);

        this.setState({
          searchedKeyword: keyword,
          searchedPages: res.data.data,
          searchResultMeta: res.data.meta,
        });
      } else {
        this.setState({
          searchError: res.data,
        });
      }

      // TODO error
    })
    .catch((res) => {
      // TODO error
      this.setState({
        searchError: res.data,
      });
    });
  };

  render() {
    return (
      <div>
        <div className="header-wrap">
          <header>
            <SearchForm
              onSearchFormChanged={this.search}
              keyword={this.state.searchingKeyword}
              />
          </header>
        </div>

        <SearchResult
          pages={this.state.searchedPages}
          searchingKeyword={this.state.searchingKeyword}
          searchResultMeta={this.state.searchResultMeta}
          />
      </div>
    );
  }
}

SearchPage.propTypes = {
  query: React.PropTypes.object,
};
SearchPage.defaultProps = {
  //pollInterval: 1000,
  query: SearchPage.getQueryByLocation(location || {}),
  searchError: null,
};

