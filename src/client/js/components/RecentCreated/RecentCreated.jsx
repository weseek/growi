import React from 'react';
import PropTypes from 'prop-types';

import { PaginationWrapper } from '~/components/PaginationWrapper';
import { apiv3Get } from '../../util/apiv3-client';

import Page from '../PageList/Page';

class RecentCreated extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      activePage: 1,
      totalPages: 0,
      pagingLimit: 10,
    };

    this.handlePage = this.handlePage.bind(this);
  }


  componentWillMount() {
    this.getRecentCreatedList(1);
  }

  async handlePage(selectedPage) {
    await this.getRecentCreatedList(selectedPage);
  }

  async getRecentCreatedList(selectedPage) {
    const { userId } = this.props;
    const page = selectedPage;

    // pagesList get and pagination calculate
    const res = await apiv3Get(`/users/${userId}/recent`, { page });
    const { totalCount, pages, limit } = res.data;

    this.setState({
      pages,
      activePage: selectedPage,
      totalPages: totalCount,
      pagingLimit: limit,
    });

  }

  /**
   * generate Elements of Page
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generatePageList(pages) {
    return pages.map(page => (
      <li key={`recent-created:list-view:${page._id}`} className="mt-4">
        <Page page={page} />
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
          align="center"
          activePage={this.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={this.state.totalPages}
          pagingLimit={this.state.pagingLimit}
          size="sm"
        />
      </div>
    );
  }

}

RecentCreated.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default RecentCreated;
