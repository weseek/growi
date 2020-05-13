import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';
import PageListMeta from '../PageList/PageListMeta';
import PagePathLabel from '../PageList/PagePathLabel';

export default class SearchResultPage extends React.Component {

  render() {
    const {
      page, noLink,
    } = this.props;

    return (
      <>
        <UserPicture user={page.lastUpdateUser} noLink={noLink} />
        <PagePathLabel page={page} />
        <PageListMeta page={page} />
      </>
    );
  }

}

SearchResultPage.propTypes = {
  page: PropTypes.object.isRequired,
  noLink: PropTypes.bool,
};

SearchResultPage.defaultProps = {
  noLink: false,
};
