import React from 'react';

import UserPicture from '../User/UserPicture';
import PageListMeta from './PageListMeta';
import PagePath from './PagePath';

export default class ListView extends React.Component {

  render() {
    const listView = this.props.pages.map((page) => {

      return (
        <li className="page-list-li" key={page._id}>
          <div className="picture-outer">
            <UserPicture user={page.revision.author} />
          </div>
          <div className="page-link-outer">
            <a className="page-list-link" href={page.path}>
              <PagePath page={page} />
            </a>
            <PageListMeta page={page} />
          </div>
        </li>
      );
    });

    return (
      <div className="page-list">
        <ul className="page-list-ul">
        {listView}
        </ul>
      </div>
    );
  }
}

ListView.propTypes = {
  pages: React.PropTypes.array.isRequired,
};

ListView.defaultProps = {
  pages: [],
};
