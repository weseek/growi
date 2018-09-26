import React from 'react';
import PropTypes from 'prop-types';
import Pagination from 'react-bootstrap/lib/Pagination';
export default class RecentCreated extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      RecentCreatedData : '',
      pages : [] ,
      limit : 10, // TODO GC-941で対応予定
      active : 1,
      totalPage: 0,
    };
    this.getRecentCreatedList = this.getRecentCreatedList.bind(this);
  }


  componentWillMount() {
    this.getRecentCreatedList(1);
    console.log(this.state);
  }
  getRecentCreatedList(selectPageNumber) {

    const pageId = this.props.pageId;
    const userId = this.props.crowi.me;
    const limit = this.state.limit;
    const offset = (selectPageNumber - 1) * limit;

    this.props.crowi.apiGet('/pages.recentCreated', {page_id: pageId , user: userId , limit: limit , offset: offset , })
      .then(res => {
        console.log("res.pages=", res.pages);
        const totalCount = res.pages[0].totalCount;
        const totalPage = totalCount % limit == 0 ? totalCount / limit : Math.floor(totalCount / limit) + 1;
        const pages = res.pages[1];
        let inUse = {};
        const active = selectPageNumber;

        this.setState({
          pages: pages,
          inUse: inUse,
          active: active,
          totalPage: totalPage,
        });
      });
  }


  render() {
    let totalPage = this.state.totalPage;
    let active = this.state.active;
    let items = [];
    let paginationStart = active;
    console.log(this.state);
    if (1 === active) {
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
        <Pagination.Prev onClick={() => this.getRecentCreatedList(this.state.active - 1)} />
      );
    }
    if (0 < (active - 2) && active < (totalPage - 2 )) {
      paginationStart = active - 2;
    }else if( active < 3){
      paginationStart = 1;
    }else if( active >= (totalPage -2) ){
      paginationStart = (totalPage > 5)? totalPage -4 : totalPage = 4 ? totalPage - 3 : totalPage -2 ;
    }
    let MaxViewNum =  (paginationStart ) + 4;
    if(totalPage < paginationStart + 4){
      MaxViewNum = totalPage;
    }
    for (let number = paginationStart; number <= MaxViewNum; number++) { // TODO GC-992で対応予定
      items.push(
        <Pagination.Item key={number} active={number === active} onClick={ () => this.getRecentCreatedList(number)}>{number}</Pagination.Item>
      );
    }
    if (totalPage === active) {
      items.push(
        <Pagination.Next disabled />
      );
      items.push(
        <Pagination.Last disabled />
      );
    }
    else {
      items.push(
        <Pagination.Next onClick={() => this.getRecentCreatedList(this.state.active + 1)} />
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
};

RecentCreated.defaultProps = {
};

