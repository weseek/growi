import React from 'react';
import PropTypes from 'prop-types';
import { templateChecker, pagePathUtils } from '@growi/core';
import FootstampIcon from '../../../../app/src/components/FootstampIcon';

const { isTopPage } = pagePathUtils;
const { checkTemplatePath } = templateChecker;

export class PageListMeta extends React.Component {

  render() {
    const { page } = this.props;

    // top check
    let topLabel;
    if (isTopPage(page.path)) {
      topLabel = <span className="badge badge-info">TOP</span>;
    }

    // template check
    let templateLabel;
    if (checkTemplatePath(page.path)) {
      templateLabel = <span className="badge badge-info">TMPL</span>;
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

    let footprintCount;
    if (true) {
      footprintCount = <span className="mr-1 footstamp-icon"><FootstampIcon />10</span>;
    }

    return (
      <span className="page-list-meta">
        {topLabel}
        {templateLabel}
        {commentCount}
        {likerCount}
        {footprintCount}
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
