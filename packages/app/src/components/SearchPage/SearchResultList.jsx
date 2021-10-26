import React from 'react';
import PropTypes from 'prop-types';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';

class SearchResultList extends React.Component {

  render() {
    return (
      <>
        {this.props.pages.map((page) => {
          // TODO : send cetain length of body (revisionBody) from elastisearch by adding some settings to the query and
          //         when keyword is not in page content, display revisionBody.
          // TASK : https://estoc.weseek.co.jp/redmine/issues/79606
          return (
            <SearchResultListItem
              page={page}
              onClickInvoked={this.props.onClickInvoked}
              noLink
            />
          );
        })}
        <div className="my-4 mx-auto">
          <PaginationWrapper
            activePage={1}
            changePage={() => { console.log('page chagned') }} // Todo: replace this with a function to change state vars
            // a total number of pages retrieved from elasticsearch on the current search condition
            totalItemsCount={this.props.searchResultCount}
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
  searchResultCount: PropTypes.number,
  onClickInvoked: PropTypes.func,
  onChangeInvoked: PropTypes.func,
};

export default SearchResultList;
