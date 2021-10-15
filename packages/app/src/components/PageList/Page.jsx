import React from 'react';
import PropTypes from 'prop-types';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';


export default class Page extends React.Component {

  render() {
    const {
      page, noLink, matchedPath,
    } = this.props;

    let pagePathElem = <PagePathLabel page={page} additionalClassNames={['mx-1']} matchedPath={matchedPath} />;
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

Page.propTypes = {
  page: PropTypes.object.isRequired,
  noLink: PropTypes.bool,
  matchedPath: PropTypes.string, // for search result list
};

Page.defaultProps = {
  noLink: false,
  matchedPath: null,
};
