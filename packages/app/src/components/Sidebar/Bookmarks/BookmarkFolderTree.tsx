import React from 'react';

import { useTranslation } from 'next-i18next';

import { useSWRxCurrentUserBookmarkFolders } from '~/stores/bookmark';

import BookmarkFolderItem from './BookmarkFolderItem';

import styles from './BookmarkFolderTree.module.scss';


const BookmarkFolderTree = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: bookmarkFolderData, mutate: mutateBookmarkFolderData } = useSWRxCurrentUserBookmarkFolders();


  if (bookmarkFolderData != null) {
    return (

      <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group p-3`}>
        {bookmarkFolderData.map((item) => {
          return (
            <BookmarkFolderItem
              key={item.bookmarkFolder._id}
              bookmarkFolders={item}
              isOpen={false}
            />
          );
        })}
      </ul>
    );
  }
  return <></>;

};

export default BookmarkFolderTree;
