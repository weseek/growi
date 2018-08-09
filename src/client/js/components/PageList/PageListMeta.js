import React from 'react';
import PropTypes from 'prop-types';

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
    const templateChecker = require('@server/util/templateChecker');

    // portal check
    let PortalLabel;
    if (this.isPortalPath(page.path)) {
      PortalLabel = <span className="label label-info">PORTAL</span>;
    }

    // template check
    let TemplateLabel;
    if (templateChecker(page.path)) {
      TemplateLabel = <span className="label label-info">TMPL</span>;
    }

    let CommentCount;
    if (page.commentCount > 0) {
      CommentCount = <span><i className="icon-bubble" />{page.commentCount}</span>;
    }

    let LikerCount;
    if (page.liker.length > 0) {
      LikerCount = <span><i className="icon-like" />{page.liker.length}</span>;
    }


    return (
      <span className="page-list-meta">
        {PortalLabel}
        {TemplateLabel}
        {CommentCount}
        {LikerCount}
      </span>
    );
  }
}

PageListMeta.propTypes = {
  page: PropTypes.object.isRequired,
};

PageListMeta.defaultProps = {
  page: {},
};

