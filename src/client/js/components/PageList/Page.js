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

    const styleFlex = {
      flex: 1,
    };

    return (
      <li className="page-list-li d-flex align-items-center">
        <UserPicture user={page.lastUpdateUser} />
        <a className="page-list-link" href={link}>
          <PagePath page={page} excludePathString={this.props.excludePathString} />
        </a>
        <PageListMeta page={page} />
        <div style={styleFlex}></div>
      </li>
    );
  }

}

Page.propTypes = {
  page: PropTypes.object.isRequired,
  linkTo: PropTypes.string,
  excludePathString: PropTypes.string,
};

Page.defaultProps = {
  linkTo: '',
  excludePathString: '',
};
