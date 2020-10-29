import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

class PaginationWrapper extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activePage: 1,
      totalItemsCount: 0,
      paginationNumbers: {},
      limit: this.props.pagingLimit || Infinity,
    };

    this.calculatePagination = this.calculatePagination.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      activePage: nextProps.activePage,
      totalItemsCount: nextProps.totalItemsCount,
      limit: nextProps.pagingLimit,
    }, () => {
      const activePage = this.state.activePage;
      const totalCount = this.state.totalItemsCount;
      const limit = this.state.limit;
      const paginationNumbers = this.calculatePagination(limit, totalCount, activePage);
      this.setState({ paginationNumbers });
    });
  }

  calculatePagination(limit, totalCount, activePage) {
    // calc totalPageNumber
    const totalPage = Math.floor(totalCount / limit) + (totalCount % limit === 0 ? 0 : 1);

    let paginationStart = activePage - 2;
    let maxViewPageNum = activePage + 2;
    // if pagiNation Number area size = 5 , pageNumber is calculated here
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
    * generate Elements of Pagination First Prev
    * ex.  <<   <   1  2  3  >  >>
    * this function set << & <
    */
  generateFirstPrev(activePage) {
    const paginationItems = [];
    if (activePage !== 1) {
      paginationItems.push(
        <PaginationItem key="painationItemFirst">
          <PaginationLink first onClick={() => { return this.props.changePage(1) }} />
        </PaginationItem>,
        <PaginationItem key="painationItemPrevious">
          <PaginationLink previous onClick={() => { return this.props.changePage(activePage - 1) }} />
        </PaginationItem>,
      );
    }
    else {
      paginationItems.push(
        <PaginationItem key="painationItemFirst" disabled>
          <PaginationLink first />
        </PaginationItem>,
        <PaginationItem key="painationItemPrevious" disabled>
          <PaginationLink previous />
        </PaginationItem>,
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
        <PaginationItem key={`paginationItem-${number}`} active={number === activePage}>
          <PaginationLink onClick={() => { return this.props.changePage(number) }}>
            {number}
          </PaginationLink>
        </PaginationItem>,
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
        <PaginationItem key="painationItemNext">
          <PaginationLink next onClick={() => { return this.props.changePage(activePage + 1) }} />
        </PaginationItem>,
        <PaginationItem key="painationItemLast">
          <PaginationLink last onClick={() => { return this.props.changePage(totalPage) }} />
        </PaginationItem>,
      );
    }
    else {
      paginationItems.push(
        <PaginationItem key="painationItemNext" disabled>
          <PaginationLink next />
        </PaginationItem>,
        <PaginationItem key="painationItemLast" disabled>
          <PaginationLink last />
        </PaginationItem>,
      );
    }
    return paginationItems;

  }

  getListClassName() {
    const listClassNames = [];

    const { align } = this.props;
    if (align === 'center') {
      listClassNames.push('justify-content-center');
    }
    if (align === 'right') {
      listClassNames.push('justify-content-end');
    }

    return listClassNames.join(' ');
  }

  render() {
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
      <React.Fragment>
        <Pagination size={this.props.size} listClassName={this.getListClassName()}>{paginationItems}</Pagination>
      </React.Fragment>
    );
  }


}

PaginationWrapper.propTypes = {

  activePage: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired,
  totalItemsCount: PropTypes.number.isRequired,
  pagingLimit: PropTypes.number.isRequired,
  align: PropTypes.string,
  size: PropTypes.string,
};

PaginationWrapper.defaultProps = {
  align: 'left',
  size: 'md',
};

export default withTranslation()(PaginationWrapper);
