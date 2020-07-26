import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';


import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import PaginationWrapper from '../PaginationWrapper';
import Page from '../PageList/Page';

class MyBookmarkList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      activePage: 1,
      totalPages: 0,
      pagingLimit: Infinity,
    };

    this.handlePage = this.handlePage.bind(this);
  }

  componentWillMount() {
    this.getMyBookmarkList(1);
  }

  async handlePage(selectedPage) {
    await this.getMyBookmarkList(selectedPage);
  }

  getMyBookmarkList(selectPageNumber) {
    const { appContainer, pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    const userId = appContainer.currentUserId;
    const limit = appContainer.getConfig().recentCreatedLimit;
    const offset = (selectPageNumber - 1) * limit;

    // pagesList get and pagination calculate
    this.props.appContainer.apiGet('/pages.recentCreated', {
      page_id: pageId, user: userId, limit, offset,
    })
      .then((res) => {
        const totalPages = res.totalCount;
        const pages = res.pages;
        const activePage = selectPageNumber;
        this.setState({
          pages,
          activePage,
          totalPages,
          pagingLimit: limit,
        });
      });
  }


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
        <PaginationWrapper
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalPages}
          pagingLimit={this.state.pagingLimit}
        />
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
