import React from 'react';
import PropTypes from 'prop-types';
import SearchResultListItem from './SearchResultListItem';

class SearchResultList extends React.Component {

  render() {
    return (
      this.props.pages.map((page) => {
        return (
          <SearchResultListItem
            page={page}
            onClickInvoked={this.props.onClickInvoked}
            noLink
          />
        );
      })
    );
  }

}

SearchResultList.propTypes = {
  pages: PropTypes.array.isRequired,
  deletionMode: PropTypes.bool.isRequired,
  selectedPages: PropTypes.array.isRequired,
  onClickInvoked: PropTypes.func,
  onChangeInvoked: PropTypes.func,
};

export default SearchResultList;
