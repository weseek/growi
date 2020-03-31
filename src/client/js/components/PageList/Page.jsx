import React from 'react';
import PropTypes from 'prop-types';

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

    const hasChildren = this.props.children != null;

    return (
      <li className="nav-item page-list-li w-100">
        <a className="nav-link page-list-link d-flex align-items-center p-0" href={link}>
          <UserPicture user={page.lastUpdateUser} />
          <PagePath page={page} excludePathString={this.props.excludePathString} />
          <PageListMeta page={page} />
          { hasChildren && (
            <React.Fragment>
              {this.props.children}
            </React.Fragment>
          )}
        </a>
      </li>
    );
  }

}

Page.propTypes = {
  page: PropTypes.object.isRequired,
  linkTo: PropTypes.string,
  excludePathString: PropTypes.string,
  children: PropTypes.array,
};

Page.defaultProps = {
  linkTo: '',
  excludePathString: '',
};
