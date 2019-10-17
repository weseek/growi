import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

class PaginationWrapper extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      totalItemsCount: 0,
      activePage: 1,
      paginationNumbers: {},
      limit: Infinity,
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
        <PaginationItem>
          <PaginationLink first onClick={() => { return this.props.changePage(1) }} />,
        </PaginationItem>,
        <PaginationItem>
          <PaginationLink previous onClick={() => { return this.props.changePage(activePage - 1) }} />,
        </PaginationItem>,
      );
    }
    else {
      paginationItems.push(
        <PaginationItem disabled>
          <PaginationLink first />,
        </PaginationItem>,
        <PaginationItem disabled>
          <PaginationLink previous />,
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
        <PaginationItem active={number === activePage}>
          <PaginationLink onClick={() => { return this.props.changePage(number) }}>{number}</PaginationLink>
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
        <PaginationItem>
          <PaginationLink next onClick={() => { return this.props.changePage(activePage + 1) }} />,
        </PaginationItem>,
        <PaginationItem>
          <PaginationLink last onClick={() => { return this.props.changePage(totalPage) }} />,
        </PaginationItem>,
      );
    }
    else {
      paginationItems.push(
        <PaginationItem disabled>
          <PaginationLink next />,
        </PaginationItem>,
        <PaginationItem disabled>
          <PaginationLink last />,
        </PaginationItem>,
      );
    }
    return paginationItems;

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
        <div>
          <Pagination size="sm">{paginationItems}</Pagination>
        </div>
      </React.Fragment>
    );
  }


}

const PaginationWrappered = (props) => {
  return createSubscribedElement(PaginationWrapper, props, [AppContainer]);
};

PaginationWrapper.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  activePage: PropTypes.number.isRequired,
  changePage: PropTypes.func.isRequired,
  totalItemsCount: PropTypes.number.isRequired,
  pagingLimit: PropTypes.number.isRequired,
};

export default withTranslation()(PaginationWrappered);
