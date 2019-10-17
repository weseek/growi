import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

// TODO: GW-333
// import Pagination from 'react-bootstrap/lib/Pagination';

class TagsList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tagData: [],
      activePage: 1,
      paginationNumbers: {},
    };

    this.calculatePagination = this.calculatePagination.bind(this);
  }

  async componentWillMount() {
    await this.getTagList(1);
  }

  async getTagList(selectPageNumber) {
    const limit = 10;
    const offset = (selectPageNumber - 1) * limit;
    const res = await this.props.crowi.apiGet('/tags.list', { limit, offset });

    const totalCount = res.totalCount;
    const tagData = res.data;
    const activePage = selectPageNumber;
    const paginationNumbers = this.calculatePagination(limit, totalCount, activePage);

    this.setState({
      tagData,
      activePage,
      paginationNumbers,
    });
  }

  calculatePagination(limit, totalCount, activePage) {
    // calc totalPageNumber
    const totalPage = Math.floor(totalCount / limit) + (totalCount % limit === 0 ? 0 : 1);

    let paginationStart = activePage - 2;
    let maxViewPageNum = activePage + 2;
    // pagination Number area size = 5 , pageNumber calculate in here
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
   * generate Elements of Tag
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generateTagList(tagData) {
    return tagData.map((data) => {
      return (
        <a key={data.name} href={`/_search?q=tag:${data.name}`} className="list-group-item">
          <i className="icon-tag mr-2"></i>{data.name}
          <span className="ml-4 list-tag-count label label-default text-muted">{data.count}</span>
        </a>
      );
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
        <Pagination.First key="first" onClick={() => { return this.getTagList(1) }} />,
      );
      paginationItems.push(
        <Pagination.Prev key="prev" onClick={() => { return this.getTagList(this.state.activePage - 1) }} />,
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
        <Pagination.Item key={number} active={number === activePage} onClick={() => { return this.getTagList(number) }}>{number}</Pagination.Item>,
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
        <Pagination.Next key="next" onClick={() => { return this.getTagList(this.state.activePage + 1) }} />,
      );
      paginationItems.push(
        <Pagination.Last key="last" onClick={() => { return this.getTagList(totalPage) }} />,
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
    const { t } = this.props;
    const messageForNoTag = this.state.tagData.length ? null : <h3>{ t('You have no tag, You can set tags on pages') }</h3>;

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
    const pagination = this.state.tagData.length ? <Pagination>{paginationItems}</Pagination> : null;

    return (
      <div className="text-center">
        <div className="tag-list">
          <ul className="list-group text-left">
            {this.generateTagList(this.state.tagData)}
          </ul>
          {messageForNoTag}
        </div>
        <div className="tag-list-pagination">
          {pagination}
        </div>
      </div>
    );
  }

}

TagsList.propTypes = {
  crowi: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // i18next
};

TagsList.defaultProps = {
};

export default withTranslation()(TagsList);
