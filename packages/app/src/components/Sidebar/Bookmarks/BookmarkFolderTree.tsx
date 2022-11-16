
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import BookmarkFolderItem from './BookmarkFolderItem';

import styles from './BookmarkFolderTree.module.scss';


const BookmarkFolderTree = (): JSX.Element => {
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();
  if (bookmarkFolderData != null) {
    return (

      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group p-3`}>
        {bookmarkFolderData.map((item) => {
          return (
            <BookmarkFolderItem
              key={item._id}
              bookmarkFolder={item}
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
