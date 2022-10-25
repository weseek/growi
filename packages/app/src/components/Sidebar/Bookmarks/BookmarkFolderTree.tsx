import React, { useRef } from 'react';

import { useTranslation } from 'next-i18next';

import { useSWRxCurrentUserBookmarkFolders } from '~/stores/bookmark';

import BookmarkFolderItem from './BookmarkFolderItem';

import styles from './BookmarkFolderTree.module.scss';

const BookmarkFolderTree = (): JSX.Element => {
  const { t } = useTranslation();
  const rootFolderRef = useRef(null);
  const { data: bookmarkFolderData, mutate: mutateBookmarkFolderData } = useSWRxCurrentUserBookmarkFolders();

  if (bookmarkFolderData != null) {
    return (

      <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group p-3`} ref={rootFolderRef}>
        {bookmarkFolderData.map((item, index) => {
          return (
            <BookmarkFolderItem key={index} bookmarkFolders={item} />
          );
        })}
      </ul>
    );
  }
  return <></>;

};

export default BookmarkFolderTree;
