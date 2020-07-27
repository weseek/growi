import React from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';
import { withUnstatedContainers } from '../UnstatedUtils';


import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import { toastError } from '../../util/apiNotification';

import PaginationWrapper from '../PaginationWrapper';

import Page from '../PageList/Page';

const logger = loggerFactory('growi:MyBookmarkList');
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

  async getMyBookmarkList(selectPageNumber) {
    const { appContainer } = this.props;

    const userId = appContainer.currentUserId;
    // const limit = appContainer.getConfig().recentCreatedLimit;
    // const offset = (selectPageNumber - 1) * limit;

    try {
      const bookmarkList = await this.props.appContainer.apiv3.get('/users', userId);
      this.setState({
        pages: bookmarkList,
      });
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error, 'Error occurred in bookmark page list');
    }
  }

  /**
   * generate Elements of Page
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generatePageList() {
    return this.state.pages.map(page => (
      <li key={`my-bookmarks-list:list-view:${page._id}`}>
        <Page page={page} />
      </li>
    ));
  }


  render() {

    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat mb-3">
          {this.generatePageList()}
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
