import React from 'react';
import PropTypes from 'prop-types';
import { templateChecker, pagePathUtils } from '@growi/core';

const { isTopPage } = pagePathUtils;
const { checkTemplatePath } = templateChecker;

export class PageListMeta extends React.Component {

  render() {
    const { pageData, pageMeta } = this.props;

    // top check
    let topLabel;
    if (isTopPage(pageData.path)) {
      topLabel = <span className="badge badge-info">TOP</span>;
    }

    // template check
    let templateLabel;
    if (checkTemplatePath(pageData.path)) {
      templateLabel = <span className="badge badge-info">TMPL</span>;
    }

    let commentCount;
    if (pageData.commentCount > 0) {
      commentCount = <span><i className="icon-bubble" />{pageData.commentCount}</span>;
    }

    let likerCount;
    if (pageData.liker.length > 0) {
      likerCount = <span><i className="icon-like" />{pageData.liker.length}</span>;
    }

    let locked;
    if (pageData.grant !== 1) {
      locked = <span><i className="icon-lock" /></span>;
    }

    let bookmarkCount;
    if (pageMeta.bookmarkCount > 0) {
      bookmarkCount = <span><i className="icon-star" />{pageMeta.bookmarkCount}</span>;
    }


    return (
      <span className="page-list-meta">
        {topLabel}
        {templateLabel}
        {commentCount}
        {likerCount}
        {locked}
        {bookmarkCount}
      </span>
    );
  }

}

PageListMeta.propTypes = {
  pageData: PropTypes.object.isRequired,
  pageMeta: PropTypes.object.isRequired,
};

PageListMeta.defaultProps = {
};
