import React from 'react';
import PropTypes from 'prop-types';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';

class SearchResultList extends React.Component {

  render() {
    return (
      <>
        {this.props.pages.map((page) => {
          return (
            <SearchResultListItem
              page={page}
              onClickInvoked={this.props.onClickInvoked}
              noLink
            />
          );
        })}
        <div className="mt-5 mx-auto">
          <PaginationWrapper
            activePage={1}
            changePage={() => { console.log('page chagned') }} // Todo: function to change state vars
            // a total number of pages that can be retrieved from elasticsearch on the current search condition
            totalItemsCount={10} // Todo: replace this with a state that dynamically changes its value
            // a number of pages to show in one page
            pagingLimit={5} // Todo: replace this with a state that dynamically changes its value
          />
        </div>
      </>
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
