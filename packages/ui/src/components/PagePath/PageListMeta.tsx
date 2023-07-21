import type { FC } from 'react';

import assert from 'assert';

import type { IPageHasId } from '@growi/core';
import { templateChecker, pagePathUtils } from '@growi/core/dist/utils';

import { FootstampIcon } from '../FootstampIcon';

const { isTopPage } = pagePathUtils;
const { checkTemplatePath } = templateChecker;


const SEEN_USERS_HIDE_THRES__ACTIVE_USERS_COUNT = 5;
const MAX_STRENGTH_LEVEL = 4;

type SeenUsersCountProps = {
  count: number,
  basisViewersCount?: number,
  shouldSpaceOutIcon?: boolean,
}

const SeenUsersCount = (props: SeenUsersCountProps): JSX.Element => {

  const { count, shouldSpaceOutIcon, basisViewersCount } = props;

  if (count === 0) {
    return <></>;
  }

  if (basisViewersCount != null && basisViewersCount <= SEEN_USERS_HIDE_THRES__ACTIVE_USERS_COUNT) {
    return <></>;
  }

  const strengthLevel = Math.ceil(
    Math.min(0, Math.log(count / (basisViewersCount ?? count))) // Max: 0
    * 2 * -1,
  );

  if (strengthLevel > MAX_STRENGTH_LEVEL) {
    return <></>;
  }

  assert(strengthLevel >= 0 && strengthLevel <= MAX_STRENGTH_LEVEL); // [0, MAX_STRENGTH_LEVEL)

  const strengthClass = `strength-${strengthLevel}`; // strength-{0, 1, 2, 3, 4}

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
  basisViewersCount?: number,
}

export const PageListMeta: FC<PageListMetaProps> = (props: PageListMetaProps) => {

  const { page, shouldSpaceOutIcon, basisViewersCount } = props;

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
      <SeenUsersCount count={page.seenUsers.length} basisViewersCount={basisViewersCount} />
      {commentCount}
      {likerCount}
      {locked}
      {bookmarkCount}
    </span>
  );

};
