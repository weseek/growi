import React from 'react';
import UserPicture from '../User/UserPicture';

import PropTypes from 'prop-types';
import Pagination from 'react-bootstrap/lib/Pagination';
export default class RecentCreated extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      limit: 10, // TODO GC-941で対応予定
      activePage: 1,
      PaginationNumbers: {},

    };
    this.calculatePagination = this.calculatePagination.bind(this);
  }


  componentWillMount() {
    this.getRecentCreatedList(1);
  }
  getRecentCreatedList(selectPageNumber) {

    const pageId = this.props.pageId;
    const userId = this.props.crowi.me;
    const limit = this.state.limit;
    const offset = (selectPageNumber - 1) * limit;

    // pagiNation
    this.props.crowi.apiGet('/pages.recentCreated', {page_id: pageId, user: userId, limit: limit, offset: offset, })
      .then(res => {
        const totalCount = res.pages[0].totalCount;
        const activePage = selectPageNumber;
        const pages = res.pages[1];
        // pageNation calculate function call
        const PaginationNumbers = this.calculatePagination(limit, totalCount, activePage);
        this.setState({
          pages,
          activePage,
          PaginationNumbers,
        });
      });
  }
  calculatePagination(limit, totalCount, activePage) {
    let PaginationNumbers = {};
    // pagiNation totalPageNumber calculate
    let totalPage = totalCount % limit === 0 ? totalCount / limit : Math.floor(totalCount / limit) + 1;
    let paginationStart;
    // pagiNation Number area size = 5 , pageNuber calculate in here
    // activePage Position calculate ex. 4 5 [6] 7 8 (Page8 over is Max), 3 4 5 [6] 7 (Page7 is Max)
    if ( activePage < 4) {
      paginationStart = 1;
    }
    else if ( activePage <= (totalPage - 2 )) {
      paginationStart = activePage- 2;
    }
    else if ( activePage >= (totalPage -2) ) {
      paginationStart = (totalPage > 5)? totalPage -4 : 1;
    }
    // MaxViewPageNum calculate ex. 4 5 6 7 8 , 1 2 3 4
    let MaxViewPageNum =  (paginationStart ) + 4;
    if (totalPage < paginationStart + 4) {
      MaxViewPageNum = totalPage;
    }
    PaginationNumbers.totalPage = totalPage;
    PaginationNumbers.paginationStart = paginationStart;
    PaginationNumbers.MaxViewPageNum = MaxViewPageNum;

    return PaginationNumbers;
  }
  /**
   * generate Elements of Page
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generatePageList(pages, user) {
    return pages.map((page, i) => {
      return (
        <li key={i}>
          <UserPicture user={user} />
          <a href={page.path} className="page-list-link" data-path={page.path} data-short-path={page.revision.body}>{decodeURI(page.path)}</a>
        </li>
      );
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
  generatePaginations(activePage, paginationStart, MaxViewPageNum) {
    let paginationItems = [];
    for (let number = paginationStart; number <= MaxViewPageNum; number++) {
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
    const username = this.props.crowi.me;
    const user = this.props.crowi.findUser(username);
    const pageList = this.generatePageList(this.state.pages, user);

    let paginationItems = [];
    let activePage = this.state.activePage;
    let totalPage = this.state.PaginationNumbers.totalPage;
    let paginationStart = this.state.PaginationNumbers.paginationStart;
    let MaxViewPageNum =  this.state.PaginationNumbers.MaxViewPageNum;
    let firstPrevItems = this.generateFirstPrev(activePage);
    paginationItems.push(firstPrevItems);
    let paginations = this.generatePaginations(activePage, paginationStart, MaxViewPageNum);
    paginationItems.push(paginations);
    let nextLastItems = this.generateNextLast(activePage, totalPage);
    paginationItems.push(nextLastItems);

    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat">
            {pageList}
        </ul>
        {
        <Pagination bsSize="small">{paginationItems}</Pagination>
        }
      </div>
    );
  }
}



RecentCreated.propTypes = {
  pageId: PropTypes.string.isRequired,
  crowi: PropTypes.object.isRequired,
};

RecentCreated.defaultProps = {
};

