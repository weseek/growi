import React, { FC } from 'react';

import assert from 'assert';

import { IPageHasId } from '@growi/app/src/interfaces/page';
import { templateChecker, pagePathUtils } from '@growi/core';

import { FootstampIcon } from '../SearchPage/FootstampIcon';

const { isTopPage } = pagePathUtils;
const { checkTemplatePath } = templateChecker;


const MIN_OPACITY_LEVEL = -3;

type SeenUsersCountProps = {
  count: number,
  activeUsersCount?: number,
  shouldSpaceOutIcon?: boolean,
}

const SeenUsersCount = (props: SeenUsersCountProps): JSX.Element => {

  const { count, shouldSpaceOutIcon, activeUsersCount } = props;

  if (count === 0) {
    return <></>;
  }

  const strengthLevel = Math.log(count / (activeUsersCount ?? count)); // Max: 0

  if (strengthLevel <= MIN_OPACITY_LEVEL) {
    return <></>;
  }

  assert(strengthLevel > MIN_OPACITY_LEVEL); // [0, MIN_OPACITY_LEVEL)

  let strengthClass = '';
  if (strengthLevel < 0) {
    strengthClass = `strength-${Math.ceil(strengthLevel * -1)}`; // opacity-{0, 1, 2, 3}
  }

  return (
    <span className={`seen-users-count ${shouldSpaceOutIcon ? 'mr-3' : ''} ${strengthClass}`}>
      <i className="footstamp-icon"><FootstampIcon /></i>
      {count}
    </span>
  );

};


type PageListMetaProps = {
  page: IPageHasId,
  likerCount?: number,
  bookmarkCount?: number,
  shouldSpaceOutIcon?: boolean,
  activeUsersCount?: number,
}

export const PageListMeta: FC<PageListMetaProps> = (props: PageListMetaProps) => {

  const { page, shouldSpaceOutIcon, activeUsersCount } = props;

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
  if (page.commentCount > 0) {
    commentCount = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="icon-bubble" />{page.commentCount}</span>;
  }

  let likerCount;
  if (props.likerCount != null && props.likerCount > 0) {
    likerCount = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="fa fa-heart-o" />{props.likerCount}</span>;
  }

  let locked;
  if (page.grant !== 1) {
    locked = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="icon-lock" /></span>;
  }

  let bookmarkCount;
  if (props.bookmarkCount != null && props.bookmarkCount > 0) {
    bookmarkCount = <span className={`${shouldSpaceOutIcon ? 'mr-3' : ''}`}><i className="fa fa-bookmark-o" />{props.bookmarkCount}</span>;
  }

  return (
    <span className="page-list-meta">
      {topLabel}
      {templateLabel}
      <SeenUsersCount count={page.seenUsers.length} activeUsersCount={activeUsersCount} />
      {commentCount}
      {likerCount}
      {locked}
      {bookmarkCount}
    </span>
  );

};
