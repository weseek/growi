import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import PageListMeta from './PageListMeta';
import PagePath from './PagePath';

export default class Page extends React.Component {

  render() {
    const {
      page, noLink, excludePathString,
    } = this.props;

    let pagePath = <PagePath page={page} excludePathString={excludePathString} />;
    if (!noLink != null) {
      pagePath = <a className="text-break" href={page.pagePath}>{pagePath}</a>;
    }

    return (
      <>
        <UserPicture user={page.lastUpdateUser} noLink={noLink} />
        {pagePath}
        <PageListMeta page={page} />
      </>
    );
  }

}

Page.propTypes = {
  page: PropTypes.object.isRequired,
  excludePathString: PropTypes.string,
  noLink: PropTypes.bool,
};

Page.defaultProps = {
  excludePathString: '',
  noLink: false,
};
