import React from 'react';
import PropTypes from 'prop-types';
import { setupMaster } from 'cluster';
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
            <>
              <SearchResultListItem
                page={page}
                onClickInvoked={this.props.onClickInvoked}
                noLink
              />
            </>
          );
        })}
        <div className="my-4 mx-auto">
          <PaginationWrapper
            activePage={this.props.activePage}
            changePage={this.props.onPageChagned}
            totalItemsCount={this.props.searchResultCount}
            pagingLimit={this.props.pagingLimit}
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
  activePage: PropTypes.number,
  onPageChagned: PropTypes.func,
  searchResultCount: PropTypes.number,
  pagingLimit: PropTypes.number,
};

export default SearchResultList;
