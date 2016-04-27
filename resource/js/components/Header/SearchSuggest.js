import React from 'react';

import ListView from '../PageList/ListView';

export default class SearchSuggest extends React.Component {

  render() {
    console.log('suggestedPages', this.props.suggestedPages);

    if (this.props.suggestedPages.length < 1) {
      return <div></div>;
    }

    return (
      <div className="search-suggest" id="search-suggest">
        <ListView pages={this.props.suggestedPages} />
      </div>
    );
  }

}

SearchSuggest.propTypes = {
  suggestedPages: React.PropTypes.array.isRequired,
};

SearchSuggest.defaultProps = {
  suggestedPages: [],
};
