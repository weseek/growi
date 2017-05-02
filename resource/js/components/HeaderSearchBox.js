// This is the root component for #search-top

import React from 'react';
import PropTypes from 'prop-types';

import SearchForm from './HeaderSearchBox/SearchForm';
import SearchSuggest from './HeaderSearchBox/SearchSuggest';

export default class SearchBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchingKeyword: '',
      searchedPages: [],
      searchError: null,
      searching: false,
      focused: false,
    }

    this.search = this.search.bind(this);
    this.isShown = this.isShown.bind(this);
  }

  isShown(focused) {
    this.setState({focused: !!focused});
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
      searching: true,
    });

    this.props.crowi.apiGet('/search', {q: keyword})
    .then(res => {
      this.setState({
        searchingKeyword: keyword,
        searchedPages: res.data,
        searching: false,
        searchError: null,
      });
    }).catch(err => {
      this.setState({
        searchError: err,
        searching: false,
      });
    });
  }

  render() {
    return (
      <div className="search-box">
        <SearchForm
          onSearchFormChanged={this.search}
          isShown={this.isShown}
          />
        <SearchSuggest
          searchingKeyword={this.state.searchingKeyword}
          searchedPages={this.state.searchedPages}
          searchError={this.state.searchError}
          searching={this.state.searching}
          focused={this.state.focused}
          />
      </div>
    );
  }
}

SearchBox.propTypes = {
  //pollInterval: PropTypes.number,
};
SearchBox.defaultProps = {
  //pollInterval: 1000,
};
