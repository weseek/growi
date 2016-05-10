// This is the root component for #search-page

import React from 'react';

import SearchForm from './SearchForm';
import SearchResult from './SearchResult';
import axios from 'axios'

export default class SearchPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      location: location,
      searchingKeyword: this.props.query.q || '',
      searchedPages: [],
      searchError: null,
    }

    this.search = this.search.bind(this);
  }

  componentDidMount() {
    if (this.state.searchingKeyword !== '')  {
      this.search({keyword: this.state.searchingKeyword});
      this.setState({searchedKeyword: this.state.keyword});
    }
  }

  static getQueryByLocation(location) {
    let search = location.search || '';
    let query = {};

    search.replace(/^\?/, '').split('&').forEach(function(element) {
      let queryParts = element.split('=');
      query[queryParts[0]] = queryParts[1];
    });

    console.log(query);
    return query;
  }

  search(data) {
    const keyword = data.keyword;
    if (keyword === '') {
      this.setState({
        searchingKeyword: '',
        searchedPages: [],
      });

      return true;
    }

    this.setState({
      searchingKeyword: keyword,
    });

    axios.get('/_api/search', {params: {q: keyword}})
    .then((res) => {
      if (res.data.ok) {
        this.setState({
          searchingKeyword: keyword,
          searchedPages: res.data.data,
        });
      }
      // TODO error
    })
    .catch((res) => {
      // TODO error
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

        <SearchResult pages={this.state.searchedPages} />
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
};

