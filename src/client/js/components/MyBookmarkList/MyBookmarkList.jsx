import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';


import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
// import { toastError } from '../../util/apiNotification';
// import PaginationWrapper from '../PaginationWrapper';
import Page from '../PageList/Page';

class MyBookmarkList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
    };

  }


  /* async getMyBookmarkList(selectPageNumber) {
    const { appContainer } = this.props;
    const userId = appContainer.currentUserId;
    const limit = 10;
    const offset = (selectPageNumber - 1) * limit;

    try {
      const { data } = await appContainer.apiv3.get(`/bookmarks/users/${userId}`, { limit, offset });
      const { docs: pages, totalDocs: totalPages, limit: pagingLimit } = data.paginateResult;
      this.setState({
        pages,
      });
    }
    catch (error) {
      toastError(error, 'Error occurred in updating History');
    }
  } */


  /**
   * generate Elements of Page
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generatePageList(bookmarks) {
    /* TODO GW-3251 */
    return bookmarks.map(bookmark => (
      <li key={`${bookmark._id}`}>
        <Page page={bookmark} />
      </li>
    ));
  }


  render() {
    const pageList = this.generatePageList(this.state.pages);

    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat mb-3">
          {pageList}
        </ul>
        {/* <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalPages}
          pagingLimit={this.state.pagingLimit}
        /> */}
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const MyBookmarkListWrapper = withUnstatedContainers(MyBookmarkList, [AppContainer, PageContainer]);

MyBookmarkList.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default MyBookmarkListWrapper;
