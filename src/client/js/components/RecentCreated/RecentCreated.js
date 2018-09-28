import React from 'react';
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
    this.getRecentCreatedList = this.getRecentCreatedList.bind(this);
    this.calculatePagination = this.calculatePagination.bind(this);
  }


  componentWillMount() {
    this.getRecentCreatedList(1);
    console.log('will mount this.state=', this.state);
  }
  getRecentCreatedList(selectPageNumber) {

    const pageId = this.props.pageId;
    const userId = this.props.crowi.me;
    const limit = this.state.limit;
    const offset = (selectPageNumber - 1) * limit;

    this.props.crowi.apiGet('/pages.recentCreated', {page_id: pageId , user: userId , limit: limit , offset: offset , })
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
    // pageNation totalPageNumber calculate
    let totalPage = totalCount % limit === 0 ? totalCount / limit : Math.floor(totalCount / limit) + 1;
    let paginationStart;
    // pageNation Number area size = 5 , pageNuber calculate in here
    // activePage Position calculate ex. 4 5 [6] 7 8 (Page8 over is Max), 3 4 5 [6] 7 (Page7 is Max)
    if ( activePage < 4) {
      paginationStart = 1;
    } else if ( activePage <= (totalPage - 2 )) {
      paginationStart = activePage- 2;
    } else if ( activePage >= (totalPage -2) ) {
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

    console.log('PagenationNumbers=', PaginationNumbers);
    return PaginationNumbers;
  }


  render() {
    console.log('this.state=', this.state);
    let totalPage = this.state.PaginationNumbers.totalPage;
    let activePage = this.state.activePage;
    let items = [];
    let paginationStart = this.state.PaginationNumbers.paginationStart;
    let MaxViewPageNum =  this.state.PaginationNumbers.MaxViewPageNum;
    if (1 == activePage) {
      items.push(
        <Pagination.First disabled />
      );
      items.push(
        <Pagination.Prev disabled />
      );
    }
    else {
      items.push(
        <Pagination.First onClick={() => this.getRecentCreatedList(1)} />
      );
      items.push(
        <Pagination.Prev onClick={() => this.getRecentCreatedList(this.state.activePage - 1)} />
      );
    }
    for (let number = paginationStart; number <= MaxViewPageNum; number++) {
      items.push(
        <Pagination.Item key={number} active={number === activePage} onClick={ () => this.getRecentCreatedList(number)}>{number}</Pagination.Item>
      );
    }
    if (totalPage === activePage) {
      items.push(
        <Pagination.Next disabled />
      );
      items.push(
        <Pagination.Last disabled />
      );
    }
    else {
      items.push(
        <Pagination.Next onClick={() => this.getRecentCreatedList(this.state.activePage + 1)} />
      );
      items.push(
        <Pagination.Last onClick={() => this.getRecentCreatedList(totalPage)} />
      );
    }
// TODO same key Warning
    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat">
          {!this.state.pages.lenth != 0 &&
            this.state.pages.map((page, i) => {
            return <li key="{page.id}">
                   <img src="/images/icons/user.svg" className="picture img-circle" ></img>
                   <a href="{page.path}" className="page-list-link" data-path="{page.path}" data-short-path="{page.revision.body}">{decodeURI(page.path)}</a>
                 </li> ;
            })
          }
        </ul>
        <Pagination bsSize="small">{items}</Pagination>
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

