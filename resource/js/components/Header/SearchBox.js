// This is the root component for #search-top

import React from 'react';

import SearchForm from './SearchForm';
import SearchSuggest from './SearchSuggest';

export default class SearchBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchingKeyword: '',
      suggestedPages: [],
    }

    this.search = this.search.bind(this);
  }

  search(data) {
    console.log('search doing ... ', data);
    //this.loadCommentsFromServer();
    this.setState({
      suggestedPages: [
        { path: '/hoge/fuga ' + data.keyword, author: '@sotarok'},
        { path: '/hoge/piyo', author: '@riaf'},
      ]
    });
  }

  render() {
    return (
      <div className="search-box">
        <SearchForm onSearchFormChanged={this.search} />
        <SearchSuggest suggestedPages={this.state.suggestedPages} />
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
