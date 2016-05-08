import React from 'react';

import ListView from '../PageList/ListView';

export default class SearchSuggest extends React.Component {

  render() {
    if (this.props.searchedPages.length < 1) {
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
};

SearchSuggest.defaultProps = {
  searchedPages: [],
};
