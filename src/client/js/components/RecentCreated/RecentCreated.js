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
        const pages = res.pages[1];
        let inUse = {};
        const active = selectPageNumber;

        this.setState({
          pages: pages,
          inUse: inUse,
          active: active,
        });
      });
  }


  render() {
    let active = this.state.active;
    let items = [];
    console.log(this.state);
// TODO GC-995 Start
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
// TODO GC-995 End
    for (let number = 1; number <= 5; number++) { // TODO GC-992で対応予定
      items.push(
        <Pagination.Item key={number} active={number === active} onClick={ () => this.getRecentCreatedList(number)}>{number}</Pagination.Item>
      );
    }
// TODO GC-995 Start
    if (5 === active) { // TODO GC-992で対応予定
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
        <Pagination.Last onClick={() => this.getRecentCreatedList(5)} /> // TODO GC-992で対応予定
      );
    }
// TODO GC-995 End
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

