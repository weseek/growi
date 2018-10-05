import React from 'react';
import Page from '../PageList/Page';

import PropTypes from 'prop-types';
import Pagination from 'react-bootstrap/lib/Pagination';
export default class RecentCreated extends React.Component {

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
    const pageId = this.props.pageId;
    const userId = this.props.crowi.me;
    const limit = this.props.limit;
    const offset = (selectPageNumber - 1) * limit;

    // pagesList get and pagination calculate
    this.props.crowi.apiGet('/pages.recentCreated', { page_id: pageId, user: userId, limit, offset })
      .then(res => {
        const totalCount = res.pages[0].totalCount;
        const activePage = selectPageNumber;
        const pages = res.pages[1];
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
    const totalPage = Math.floor(totalCount / limit) + (totalCount % limit === 0 ? 0  : 1);

    let paginationStart = activePage - 2;
    let maxViewPageNum =  activePage + 2;
    // pagiNation Number area size = 5 , pageNuber calculate in here
    // activePage Position calculate ex. 4 5 [6] 7 8 (Page8 over is Max), 3 4 5 [6] 7 (Page7 is Max)
    if ( paginationStart < 1 ) {
      const diff = 1 - paginationStart;
      paginationStart += diff;
      maxViewPageNum = Math.min(totalPage, maxViewPageNum + diff);
    }
    if ( maxViewPageNum > totalPage ) {
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
    return pages.map(page => {
      return <Page page={page} key={'recent-created:list-view:' + page._id} />;
    });

  }

  /**
   * generate Elements of Pagination First Prev
   * ex.  <<   <   1  2  3  >  >>
   * this function set << & <
   */
  generateFirstPrev(activePage) {
    let paginationItems = [];
    if (1 != activePage) {
      paginationItems.push(
        <Pagination.First key="first" onClick={() => this.getRecentCreatedList(1)} />
      );
      paginationItems.push(
        <Pagination.Prev key="prev" onClick={() => this.getRecentCreatedList(this.state.activePage - 1)} />
      );
    }
    else {
      paginationItems.push(
        <Pagination.First key="first" disabled />
      );
      paginationItems.push(
        <Pagination.Prev key="prev" disabled />
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
    let paginationItems = [];
    for (let number = paginationStart; number <= maxViewPageNum; number++) {
      paginationItems.push(
        <Pagination.Item key={number} active={number === activePage} onClick={ () => this.getRecentCreatedList(number)}>{number}</Pagination.Item>
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
    let paginationItems = [];
    if (totalPage != activePage) {
      paginationItems.push(
        <Pagination.Next key="next" onClick={() => this.getRecentCreatedList(this.state.activePage + 1)} />
      );
      paginationItems.push(
        <Pagination.Last key="last" onClick={() => this.getRecentCreatedList(totalPage)} />
      );
    }
    else {
      paginationItems.push(
        <Pagination.Next key="next" disabled />
      );
      paginationItems.push(
        <Pagination.Last key="last" disabled />
      );

    }
    return paginationItems;

  }

  render() {
    const pageList = this.generatePageList(this.state.pages);

    let paginationItems = [];

    const activePage = this.state.activePage;
    const totalPage = this.state.paginationNumbers.totalPage;
    const paginationStart = this.state.paginationNumbers.paginationStart;
    const maxViewPageNum =  this.state.paginationNumbers.maxViewPageNum;
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
        <Pagination bsSize="small">{paginationItems}</Pagination>
      </div>
    );
  }
}



RecentCreated.propTypes = {
  pageId: PropTypes.string.isRequired,
  crowi: PropTypes.object.isRequired,
  limit: PropTypes.number,
};

RecentCreated.defaultProps = {
};

