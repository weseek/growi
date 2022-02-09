import React from 'react';
import PropTypes from 'prop-types';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';


export default class PageListItemS extends React.Component {

  render() {
    const {
      page, noLink,
    } = this.props;

    let pagePathElem = <PagePathLabel path={page.path} additionalClassNames={['mx-1']} />;
    if (!noLink) {
      pagePathElem = <a className="text-break" href={page.path}>{pagePathElem}</a>;
    }

    return (
      <>
        <UserPicture user={page.lastUpdateUser} noLink={noLink} />
        {pagePathElem}
        <PageListMeta page={page} />
      </>
    );
  }

}

PageListItemS.propTypes = {
  page: PropTypes.object.isRequired,
  noLink: PropTypes.bool,
};

PageListItemS.defaultProps = {
  noLink: false,
};
