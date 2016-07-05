import React from 'react';

import UserPicture from '../User/UserPicture';
import PageListMeta from './PageListMeta';
import PagePath from './PagePath';

export default class Page extends React.Component {

  render() {
    const page = this.props.page;
    let link = this.props.linkTo;
    if (link === '') {
      link = page.path;
    }

    return (
      <li className="page-list-li">
        {this.props.children}
        <UserPicture user={page.revision.author} />
        <a className="page-list-link" href={link}>
          <PagePath page={page} excludePathString={this.props.excludePathString} />
        </a>
        <PageListMeta page={page} />
      </li>
    );
  }
}

Page.propTypes = {
  page: React.PropTypes.object.isRequired,
  linkTo: React.PropTypes.string,
};

Page.defaultProps = {
  page: {},
  linkTo: '',
  excludePathString: '',
};

