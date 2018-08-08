// This is the root component for #search-top

import React from 'react';

import SearchForm from './HeaderSearchBox/SearchForm';
// import SearchSuggest from './HeaderSearchBox/SearchSuggest'; // omit since using react-bootstrap-typeahead in SearchForm

export default class SearchBox extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="search-box">
        <SearchForm />
        {/* omit since using react-bootstrap-typeahead in SearchForm
        <SearchSuggest
          searchingKeyword={this.state.searchingKeyword}
          searchedPages={this.state.searchedPages}
          searchError={this.state.searchError}
          searching={this.state.searching}
          focused={this.state.focused}
          />
        */}
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
