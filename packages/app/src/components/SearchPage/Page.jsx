import React from 'react';
import PropTypes from 'prop-types';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';
import { DevidedPagePath } from '@growi/core';


export default class Page extends React.Component {

  render() {
    const {
      page, noLink,
    } = this.props;
    const dPagePath = new DevidedPagePath(page.path, false, true);

    let pagePathElem = <PagePathLabel page={page} isFormerOnly />;
    if (!noLink) {
      pagePathElem = <a className="text-break" href={page.path}>{pagePathElem}</a>;
    }

    return (
      <>
        <div>
          {pagePathElem}
          <h4 className="my-1">
            <UserPicture user={page.lastUpdateUser} noLink={noLink} />
            <span className="ml-2">{dPagePath.latter}</span>
          </h4>
        </div>
        <div>
          <PageListMeta page={page} />
        </div>

      </>
    );
  }

}

Page.propTypes = {
  page: PropTypes.object.isRequired,
  noLink: PropTypes.bool,
};

Page.defaultProps = {
  noLink: false,
};
