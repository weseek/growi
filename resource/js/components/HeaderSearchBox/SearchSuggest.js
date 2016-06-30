import React from 'react';

import ListView from '../PageList/ListView';

export default class SearchSuggest extends React.Component {

  render() {
    if (!this.props.focused) {
      return <div></div>;
    }

    if (this.props.searching) {
      return (
        <div className="search-suggest" id="search-suggest">
          <i className="searcing fa fa-circle-o-notch fa-spin fa-fw"></i> Searching ...
        </div>
      );
    }

    if (this.props.searchError !== null) {
      return (
        <div className="search-suggest" id="search-suggest">
          <i className="searcing fa fa-warning"></i> Error on searching.
        </div>
      );
    }

    if (this.props.searchedPages.length < 1) {
      if (this.props.searchingKeyword !== '') {
        return (
          <div className="search-suggest" id="search-suggest">
            No results for "{this.props.searchingKeyword}".
          </div>
        );
      }
      return <div></div>;
    }

    return (
      <div className="search-suggest" id="search-suggest">
        <ListView pages={this.props.searchedPages} />
      </div>
    );
  }

}

SearchSuggest.propTypes = {
  searchedPages: React.PropTypes.array.isRequired,
  searchingKeyword: React.PropTypes.string.isRequired,
  searching: React.PropTypes.bool.isRequired,
};

SearchSuggest.defaultProps = {
  searchedPages: [],
  searchingKeyword: '',
  searchError: null,
  searching: false,
  focused: false,
};
