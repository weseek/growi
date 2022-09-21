import React, { useCallback } from 'react';

import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import styles from '~/components/ContentLinkButtons.module.scss';
import { RecentlyCreatedIcon } from '~/components/Icons/RecentlyCreatedIcon';
import { usePageUser } from '~/stores/context';

export const ContentLinkButtons = (): JSX.Element => {

  const WIKI_HEADER_LINK = 120;

  const { data: pageUser } = usePageUser();

  const BookMarkLinkButtonClickHandler = useCallback(() => {
    const getBookMarkListHeaderDom = document.getElementById('bookmarks-list');
    if (getBookMarkListHeaderDom == null) { return }
    smoothScrollIntoView(getBookMarkListHeaderDom, WIKI_HEADER_LINK);
  }, []);

  const RecentlyCreatedListButtonClickHandler = useCallback(() => {
    const getRecentlyCreatedListHeaderDom = document.getElementById('recently-created-list');
    if (getRecentlyCreatedListHeaderDom == null) { return }
    smoothScrollIntoView(getRecentlyCreatedListHeaderDom, WIKI_HEADER_LINK);
  }, []);

  const BookMarkLinkButton = () => {
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
  };

  const RecentlyCreatedLinkButton = () => {
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
  };

  if (pageUser == null || pageUser.name === '') {
    return <></>;
  }

  return (
    <div className="mt-3 d-flex justify-content-between">
      <BookMarkLinkButton />
      <RecentlyCreatedLinkButton />
    </div>
  );

};
