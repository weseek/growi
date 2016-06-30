// This is the root component for #page-list-search

import React from 'react';
import axios from 'axios'

export default class PageListSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
    }

    //this.changeURL = this.changeURL.bind(this);
    this.search = this.search.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.ticker = null;
  }

  componentDidMount() {
    // This is temporary data bind
    this.ticker = setInterval(this.pageListObserver.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.ticker);
  }

  pageListObserver() {
    let value = $('#page-list-search-form').val();
    this.setState({keyword: value});
    this.search();
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

  handleChange(event) {
    // this is not fired now because of force-data-bound by jQuery
    const keyword = event.target.value;
    this.setState({keyword});
    console.log('Changed');
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

  search() {
    const keyword = this.state.keyword;

    console.log('Search with', keyword);
    return true ;

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
        this.changeURL(keyword);

        this.setState({
          searchedKeyword: keyword,
          searchedPages: res.data.data,
          searchResultMeta: res.data.meta,
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
        <input
          type="hidden"
          name="q"
          value={this.state.keyword}
          onChange={this.handleChange}
          className="form-control"
          />
      </div>
    );
  }
}

PageListSearch.propTypes = {
  query: React.PropTypes.object,
};
PageListSearch.defaultProps = {
  //pollInterval: 1000,
  query: PageListSearch.getQueryByLocation(location || {}),
};

