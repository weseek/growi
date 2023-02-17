
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import BookmarkFolderItem from './BookmarkFolderItem';

import styles from './BookmarkFolderTree.module.scss';


type BookmarkFolderTreeProps = {
  isUserHomePage?: boolean
}

const BookmarkFolderTree = (props: BookmarkFolderTreeProps): JSX.Element => {
  const { data: bookmarkFolderData } = useSWRxBookamrkFolderAndChild();
  const { isUserHomePage } = props;

  return (
    <>
      <ul className={`grw-foldertree ${styles['grw-foldertree']} list-group px-3 pt-3`}>
        {bookmarkFolderData?.map((item) => {
          return (
            <BookmarkFolderItem
              key={item._id}
              bookmarkFolder={item}
              isOpen={false}
              level={0}
              root={item._id}
              isUserHomePage={isUserHomePage}
            />
          );
        })}
      </ul>
    </>
  );


};

export default BookmarkFolderTree;
