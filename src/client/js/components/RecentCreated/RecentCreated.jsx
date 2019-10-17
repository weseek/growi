import React from 'react';
import PropTypes from 'prop-types';

// TODO: GW-333
// import Pagination from 'react-bootstrap/lib/Pagination';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import Page from '../PageList/Page';

class RecentCreated extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      activePage: 1,
      paginationNumbers: {},
    };
    this.calculatePagination = this.calculatePagination.bind(this);
  }


  componentWillMount() {
    this.getRecentCreatedList(1);
  }

  getRecentCreatedList(selectPageNumber) {
    const { appContainer, pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    const userId = appContainer.me;
    const limit = appContainer.getConfig().recentCreatedLimit;
    const offset = (selectPageNumber - 1) * limit;

    // pagesList get and pagination calculate
    this.props.appContainer.apiGet('/pages.recentCreated', {
      page_id: pageId, user: userId, limit, offset,
    })
      .then((res) => {
        const totalCount = res.totalCount;
        const pages = res.pages;
        const activePage = selectPageNumber;
        // pagiNation calculate function call
        const paginationNumbers = this.calculatePagination(limit, totalCount, activePage);
        this.setState({
          pages,
          activePage,
          paginationNumbers,
        });
      });
  }

  calculatePagination(limit, totalCount, activePage) {
    // calc totalPageNumber
    const totalPage = Math.floor(totalCount / limit) + (totalCount % limit === 0 ? 0 : 1);

    let paginationStart = activePage - 2;
    let maxViewPageNum = activePage + 2;
    // pagiNation Number area size = 5 , pageNuber calculate in here
    // activePage Position calculate ex. 4 5 [6] 7 8 (Page8 over is Max), 3 4 5 [6] 7 (Page7 is Max)
    if (paginationStart < 1) {
      const diff = 1 - paginationStart;
      paginationStart += diff;
      maxViewPageNum = Math.min(totalPage, maxViewPageNum + diff);
    }
    if (maxViewPageNum > totalPage) {
      const diff = maxViewPageNum - totalPage;
      maxViewPageNum -= diff;
      paginationStart = Math.max(1, paginationStart - diff);
    }

    return {
      totalPage,
      paginationStart,
      maxViewPageNum,
    };
  }

  /**
   * generate Elements of Page
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generatePageList(pages) {
    return pages.map((page) => {
      return <Page page={page} key={`recent-created:list-view:${page._id}`} />;
    });

  }

  /**
   * generate Elements of Pagination First Prev
   * ex.  <<   <   1  2  3  >  >>
   * this function set << & <
   */
  generateFirstPrev(activePage) {
    const paginationItems = [];
    if (activePage !== 1) {
      paginationItems.push(
        <Pagination.First key="first" onClick={() => { return this.getRecentCreatedList(1) }} />,
      );
      paginationItems.push(
        <Pagination.Prev key="prev" onClick={() => { return this.getRecentCreatedList(this.state.activePage - 1) }} />,
      );
    }
    else {
      paginationItems.push(
        <Pagination.First key="first" disabled />,
      );
      paginationItems.push(
        <Pagination.Prev key="prev" disabled />,
      );

    }
    return paginationItems;
  }

  /**
   * generate Elements of Pagination First Prev
   *  ex. << < 4 5 6 7 8 > >>, << < 1 2 3 4 > >>
   * this function set  numbers
   */
  generatePaginations(activePage, paginationStart, maxViewPageNum) {
    const paginationItems = [];
    for (let number = paginationStart; number <= maxViewPageNum; number++) {
      paginationItems.push(
        <Pagination.Item key={number} active={number === activePage} onClick={() => { return this.getRecentCreatedList(number) }}>{number}</Pagination.Item>,
      );
    }
    return paginationItems;
  }

  /**
   * generate Elements of Pagination First Prev
   * ex.  <<   <   1  2  3  >  >>
   * this function set > & >>
   */
  generateNextLast(activePage, totalPage) {
    const paginationItems = [];
    if (totalPage !== activePage) {
      paginationItems.push(
        <Pagination.Next key="next" onClick={() => { return this.getRecentCreatedList(this.state.activePage + 1) }} />,
      );
      paginationItems.push(
        <Pagination.Last key="last" onClick={() => { return this.getRecentCreatedList(totalPage) }} />,
      );
    }
    else {
      paginationItems.push(
        <Pagination.Next key="next" disabled />,
      );
      paginationItems.push(
        <Pagination.Last key="last" disabled />,
      );

    }
    return paginationItems;

  }

  render() {
    const pageList = this.generatePageList(this.state.pages);

    const paginationItems = [];

    const activePage = this.state.activePage;
    const totalPage = this.state.paginationNumbers.totalPage;
    const paginationStart = this.state.paginationNumbers.paginationStart;
    const maxViewPageNum = this.state.paginationNumbers.maxViewPageNum;
    const firstPrevItems = this.generateFirstPrev(activePage);
    paginationItems.push(firstPrevItems);
    const paginations = this.generatePaginations(activePage, paginationStart, maxViewPageNum);
    paginationItems.push(paginations);
    const nextLastItems = this.generateNextLast(activePage, totalPage);
    paginationItems.push(nextLastItems);

    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat">
          {pageList}
        </ul>
        <Pagination className="btn-sm">{paginationItems}</Pagination>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RecentCreatedWrapper = (props) => {
  return createSubscribedElement(RecentCreated, props, [AppContainer, PageContainer]);
};

RecentCreated.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default RecentCreatedWrapper;
