// This is the root component for #page-list-search

import React from 'react';
import PropTypes from 'prop-types';

import SearchResult from './SearchPage/SearchResult';

export default class PageListSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      location: location,
      tree: $('#search-listpage-input').data('path'),
      searchingKeyword: this.props.query.q || '',
      searchedKeyword: '',
      searchedPages: [],
      searchResultMeta: {},
      searchError: null,
    };

    this.changeURL = this.changeURL.bind(this);
    this.search = this.search.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const $pageListSearchForm = $('#search-listpage-input');

    // search after page initialized
    if (this.state.searchingKeyword !== '') {
      const keyword = this.state.searchingKeyword;
      $pageListSearchForm.val(keyword);
      this.search({keyword});
    }

    // This is temporary data bind ... (out of component)
    $('#search-listpage-form').on('submit', () => {
      const keyword = $pageListSearchForm.val();
      if (keyword != this.state.searchingKeyword)  {
        this.search({keyword});
      }

      return false;
    });

    $('#search-listpage-clear').on('click', () => {
      $pageListSearchForm.val('');
      this.search({keyword: ''});

      return false;
    });
  }

  componentWillUnmount() {
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
    this.setState({searchedKeyword: keyword});
    //console.log('Changed');
  }

  stopSearching() {
    $('#content-main').show();
    $('#search-listpage-clear').hide();
    $('.main-container').removeClass('aside-hidden');
  }

  startSearching() {
    $('#content-main').hide();
    $('#search-listpage-clear').show();
    $('.main-container').addClass('aside-hidden');
  }

  changeURL(keyword, refreshHash) {
    const tree = this.state.tree;
    let hash = location.hash || '';
    // TODO 整理する
    if (refreshHash || this.state.searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `${tree}?q=${keyword}${hash}`);
    }
  }

  search(data) {
    const keyword = data.keyword || '';
    const tree = this.state.tree;

    this.changeURL(keyword);
    if (keyword === '') {
      this.stopSearching();
      this.setState({
        searchingKeyword: '',
        searchedPages: [],
        searchResultMeta: {},
        searchError: null,
      });

      return true;
    }

    this.startSearching();
    this.setState({
      searchingKeyword: keyword,
    });

    this.props.crowi.apiGet('/search', {q: keyword, tree: tree})
    .then((res) => {
      this.setState({
        searchedKeyword: keyword,
        searchedPages: res.data,
        searchResultMeta: res.meta,
      });
    }).catch(err => {
      this.setState({
        searchError: err,
      });
    });
  }

  render() {
    return (
      <div>
        <input
          type="hidden"
          name="q"
          value={this.state.searchingKeyword}
          onChange={this.handleChange}
          className="form-control"
          />
        <SearchResult
          tree={this.state.tree}
          pages={this.state.searchedPages}
          searchingKeyword={this.state.searchingKeyword}
          searchResultMeta={this.state.searchResultMeta}
          searchError={this.state.searchError}
          crowi={this.props.crowi}
          />
      </div>
    );
  }
}

PageListSearch.propTypes = {
  query: PropTypes.object,
  crowi: PropTypes.object.isRequired,
};
PageListSearch.defaultProps = {
  //pollInterval: 1000,
  query: PageListSearch.getQueryByLocation(location || {}),
};

