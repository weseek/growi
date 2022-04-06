import React from 'react';
import PropTypes from 'prop-types';
import { templateChecker, pagePathUtils } from '@growi/core';
import { FootstampIcon } from '../SearchPage/FootstampIcon';

const { isTopPage } = pagePathUtils;
const { checkTemplatePath } = templateChecker;

export class PageListMeta extends React.Component {

  render() {
    const { page, shouldSpaceOutIcon } = this.props;

    // top check
    let topLabel;
    if (isTopPage(page.path)) {
      topLabel = <span className={`badge badge-info ${shouldSpaceOutIcon ? 'mr-3' : ''} top-label`}>TOP</span>;
    }

    // template check
    let templateLabel;
    if (checkTemplatePath(page.path)) {
      templateLabel = <span className={`badge badge-info ${shouldSpaceOutIcon ? 'mr-3' : ''}`}>TMPL</span>;
    }

    let commentCount;
    if (page.commentCount != null && page.commentCount > 0) {
      commentCount = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="icon-bubble" />{page.commentCount}</span>;
    }

    // liker count section
    let likedCount;
    if (this.props.likerCount > 0) {
      likedCount = this.props.likerCount;
    }
    else if (page.liker != null && page.liker.length > 0) {
      likedCount = page.liker.length;
    }

    let likerCount;
    if (likedCount > 0) {
      likerCount = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="fa fa-heart-o" />{likedCount}</span>;
    }

    let locked;
    if (page.grant !== 1) {
      locked = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="icon-lock" /></span>;
    }

    let seenUserCount;
    if (page.seenUserCount > 0) {
      seenUserCount = (
        <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}>
          <i className="footstamp-icon"><FootstampIcon /></i>
          {page.seenUsers.length}
        </span>
      );
    }

    let bookmarkCount;
    if (this.props.bookmarkCount > 0) {
      bookmarkCount = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="fa fa-bookmark-o" />{this.props.bookmarkCount}</span>;
    }

    return (
      <span className="page-list-meta">
        {topLabel}
        {templateLabel}
        {seenUserCount}
        {commentCount}
        {likerCount}
        {locked}
        {bookmarkCount}
      </span>
    );
  }

}

PageListMeta.propTypes = {
  page: PropTypes.object.isRequired,
  likerCount: PropTypes.number,
  bookmarkCount: PropTypes.number,
  shouldSpaceOutIcon: PropTypes.bool,
};
