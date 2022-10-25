import React from 'react';

import { IUserHasId } from '@growi/core';
import { Link as ScrollLink } from 'react-scroll';

import { DEFAULT_AUTO_SCROLL_OPTS } from '~/client/util/smooth-scroll';
import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';

import styles from './ContentLinkButtons.module.scss';

const OFFSET = -120;

const BookMarkLinkButton = React.memo(() => {

  return (
    <ScrollLink to="bookmarks-list" offset={OFFSET} {...DEFAULT_AUTO_SCROLL_OPTS}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-2"
      >
        <i className="fa fa-fw fa-bookmark-o"></i>
        <span>Bookmarks</span>
      </button>
    </ScrollLink>
  );
});

BookMarkLinkButton.displayName = 'BookMarkLinkButton';

const RecentlyCreatedLinkButton = React.memo(() => {

  return (
    <ScrollLink to="recently-created-list" offset={OFFSET} {...DEFAULT_AUTO_SCROLL_OPTS}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-3"
      >
        <i className={`${styles['grw-icon-container-recently-created']} grw-icon-container-recently-created mr-2`}><RecentlyCreatedIcon /></i>
        <span>Recently Created</span>
      </button>
    </ScrollLink>
  );
});

RecentlyCreatedLinkButton.displayName = 'RecentlyCreatedLinkButton';


export type ContentLinkButtonsProps = {
  author?: IUserHasId,
}

export const ContentLinkButtons = (props: ContentLinkButtonsProps): JSX.Element => {

  const { author } = props;

  if (author == null || author.status === 4) {
    return <></>;
  }

  return (
    <div className="mt-3 d-flex justify-content-between">
      <BookMarkLinkButton />
      <RecentlyCreatedLinkButton />
    </div>
  );

};
