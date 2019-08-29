import React from 'react';
import PropTypes from 'prop-types';
import templateChecker from '@commons/util/template-checker';

export default class PageListMeta extends React.Component {

  isPortalPath(path) {
    if (path.match(/.*\/$/)) {
      return true;
    }

    return false;
  }

  render() {
    // TODO isPortal()
    const page = this.props.page;

    // portal check
    let portalLabel;
    if (this.isPortalPath(page.path)) {
      portalLabel = <span className="label label-info">PORTAL</span>;
    }

    // template check
    let templateLabel;
    if (templateChecker(page.path)) {
      templateLabel = <span className="label label-info">TMPL</span>;
    }

    let commentCount;
    if (page.commentCount > 0) {
      commentCount = <span><i className="icon-bubble" />{page.commentCount}</span>;
    }

    let likerCount;
    if (page.liker.length > 0) {
      likerCount = <span><i className="icon-like" />{page.liker.length}</span>;
    }

    let locked;
    if (page.grant !== 1) {
      locked = <span><i className="icon-lock" /></span>;
    }

    return (
      <span className="page-list-meta">
        {portalLabel}
        {templateLabel}
        {commentCount}
        {likerCount}
        {locked}
      </span>
    );
  }

}

PageListMeta.propTypes = {
  page: PropTypes.object.isRequired,
};

PageListMeta.defaultProps = {
};
