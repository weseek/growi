import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import BookmarkFolderItem from './BookmarkFolderItem';

import styles from './BookmarkFolderTree.module.scss';


const BookmarkFolderTree = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const updateActiveElement = (parentId: string | null) => {
    setActiveElement(parentId);
  };

  if (bookmarkFolderData != null) {
    return (

      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group p-3`}>
        {bookmarkFolderData.map((item) => {
          return (
            <BookmarkFolderItem
              key={item.bookmarkFolder._id}
              bookmarkFolders={item}
              isOpen={false}
              updateActiveElement={updateActiveElement}
              isActive={item.bookmarkFolder._id === activeElement}
            />
          );
        })}
      </ul>
    );
  }
  return <></>;

};

export default BookmarkFolderTree;
