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
        {this.props.searchResultCount > 0 && (
          <div className="my-4 mx-auto">
            <PaginationWrapper
              activePage={this.props.activePage || 1}
              changePage={this.props.onPagingNumberChanged}
              totalItemsCount={this.props.searchResultCount || 0}
              pagingLimit={this.props.pagingLimit}
            />
          </div>
        )}
      </>
    );
  }

}

SearchResultList.propTypes = {
  pages: PropTypes.array.isRequired,
  deletionMode: PropTypes.bool.isRequired,
  selectedPages: PropTypes.array.isRequired,
  searchResultCount: PropTypes.number,
  activePage: PropTypes.number,
  pagingLimit: PropTypes.number,
  onClickInvoked: PropTypes.func,
  onChangeInvoked: PropTypes.func,
  onPagingNumberChanged: PropTypes.func,
};

export default SearchResultList;
