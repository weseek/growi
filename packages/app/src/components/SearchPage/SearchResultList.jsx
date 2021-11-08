import React from 'react';
import PropTypes from 'prop-types';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';

class SearchResultList extends React.Component {

  render() {
    const { focusedPage } = this.props;
    const focusedPageId = focusedPage != null && focusedPage.id != null ? focusedPage.id : '';
    return (
      <>
        {this.props.pages.map((page) => {
        // TODO : send cetain length of body (revisionBody) from elastisearch by adding some settings to the query and
        //         when keyword is not in page content, display revisionBody.
        // TASK : https://estoc.weseek.co.jp/redmine/issues/79606
          return (
            <SearchResultListItem
              key={page._id}
              page={page}
              onClickInvoked={this.props.onClickInvoked}
              isSelected={page._id === focusedPageId || false}
              noLink
            />
          );
        })}
        {this.props.searchResultCount != null && this.props.searchResultCount > 0 && (
          <div className="my-4 mx-auto">
            <PaginationWrapper
              activePage={this.props.activePage}
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
  focusedPage: PropTypes.object,
  selectedPages: PropTypes.array.isRequired,
  searchResultCount: PropTypes.number,
  activePage: PropTypes.number.isRequired,
  pagingLimit: PropTypes.number,
  onClickInvoked: PropTypes.func,
  onChangeInvoked: PropTypes.func,
  onPagingNumberChanged: PropTypes.func,
};

export default SearchResultList;
