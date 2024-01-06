import React from 'react';

import type { IUserHasId } from '@growi/core';
import { Link as ScrollLink } from 'react-scroll';

import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';

import styles from './ContentLinkButtons.module.scss';

const BookMarkLinkButton = React.memo(() => {

  return (
    <ScrollLink to="bookmarks-list" offset={-120}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-flex align-items-center me-2"
      >
        <span className="material-symbols-outlined me-1">bookmark</span>
        <span>Bookmarks</span>
      </button>
    </ScrollLink>
  );
});

BookMarkLinkButton.displayName = 'BookMarkLinkButton';

const RecentlyCreatedLinkButton = React.memo(() => {

  return (
    <ScrollLink to="recently-created-list" offset={-120}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-flex align-items-center"
      >
        <span className="material-symbols-outlined me-1">edit</span>
        <span className="text-nowrap">Recently Created</span>
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
