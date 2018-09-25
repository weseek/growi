import React from 'react';
import PropTypes from 'prop-types';
import Pagination from 'react-bootstrap/lib/Pagination';
export default class RecentCreated extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      RecentCreatedData : '',
      pages : [] ,
    };
    this.getRecentCreatedList = this.getRecentCreatedList.bind(this);
  }


  componentWillMount() {
    this.getRecentCreatedList( );
    console.log(this.state);
  }
  getRecentCreatedList(selectPageNumber) {

    const pageId = this.props.pageId;
    const userId = this.props.crowi.me;
    const limit = 1; // TODO 表示件数。
    const offset = selectPageNumber; // TODO 何件目から取得するか　(ページ番号 - 1) * 表示件数

    this.props.crowi.apiGet('/pages.list', {page_id: pageId , user: userId , limit: limit , offset: offset , })
      .then(res => {
        const pages = res.pages;
        let inUse = {};

        this.setState({
          pages: pages,
          inUse: inUse,
        });
      });
  }


  render() {
    let active = 1;
    let items = [];
    console.log(this.state);
    for (let number = 1; number <= 5; number++) {
      items.push(
        <Pagination.Item key={number} active={number === active} onClick={ () => this.getRecentCreatedList(number)}>{number}</Pagination.Item>
      );
    }
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

