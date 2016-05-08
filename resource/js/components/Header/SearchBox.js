// This is the root component for #search-top

import React from 'react';

import SearchForm from './SearchForm';
import SearchSuggest from './SearchSuggest';
import axios from 'axios'

export default class SearchBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchingKeyword: '',
      searchedPages: [],
      searchError: null,
    }

    this.search = this.search.bind(this);
  }

  search(data) {
    const keyword = data.keyword;

    axios.get('/_api/search', {params: {q: keyword}})
    .then((res) => {
      if (res.data.ok) {
        this.setState({
          searchedPages: res.data.data
        });
      }
      // TODO error
    })
    .catch((res) => {
      // TODO error
    });
  }

  render() {
    return (
      <div className="search-box">
        <SearchForm onSearchFormChanged={this.search} />
        <SearchSuggest searchedPages={this.state.searchedPages} />
      </div>
    );
  }
}

SearchBox.propTypes = {
  //pollInterval: React.PropTypes.number,
};
SearchBox.defaultProps = {
  //pollInterval: 1000,
};
