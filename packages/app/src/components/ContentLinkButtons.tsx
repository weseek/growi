import React, { useCallback } from 'react';

import { IUserHasId } from '@growi/core';

import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';

import styles from './ContentLinkButtons.module.scss';

const WIKI_HEADER_LINK = 120;

const BookMarkLinkButton = React.memo(() => {

  const BookMarkLinkButtonClickHandler = useCallback(() => {
    const getBookMarkListHeaderDom = document.getElementById('bookmarks-list');
    if (getBookMarkListHeaderDom == null) { return }
    smoothScrollIntoView(getBookMarkListHeaderDom, WIKI_HEADER_LINK);
  }, []);

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm px-2"
      onClick={BookMarkLinkButtonClickHandler}
    >
      <i className="fa fa-fw fa-bookmark-o"></i>
      <span>Bookmarks</span>
    </button>
  );
});

BookMarkLinkButton.displayName = 'BookMarkLinkButton';

const RecentlyCreatedLinkButton = React.memo(() => {

  const RecentlyCreatedListButtonClickHandler = useCallback(() => {
    const getRecentlyCreatedListHeaderDom = document.getElementById('recently-created-list');
    if (getRecentlyCreatedListHeaderDom == null) { return }
    smoothScrollIntoView(getRecentlyCreatedListHeaderDom, WIKI_HEADER_LINK);
  }, []);

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm px-3"
      onClick={RecentlyCreatedListButtonClickHandler}
    >
      <i className={`${styles['grw-icon-container-recently-created']} grw-icon-container-recently-created mr-2`}><RecentlyCreatedIcon /></i>
      <span>Recently Created</span>
    </button>
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
