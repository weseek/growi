import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import CountBadge from '~/components/Common/CountBadge';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';
import { useSWRxChildBookmarkFolders } from '~/stores/bookmark';


type BookmarkFolderItemProps = {
  bookmarkFolders: BookmarkFolderItems
  isOpen?: boolean
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const { bookmarkFolders, isOpen: _isOpen = false } = props;
  const { t } = useTranslation();
  const hasChildren = bookmarkFolders.childCount > 0;
  const [currentParentFolder, setCurrentParentFolder] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxChildBookmarkFolders(isOpen, currentParentFolder);

  useEffect(() => {
    setCurrentParentFolder(bookmarkFolders.bookmarkFolder._id);
  }, [bookmarkFolders]);

  const onClickHandler = useCallback(async() => {
    setCurrentParentFolder(bookmarkFolders.bookmarkFolder._id);
    setIsOpen(!isOpen);
    setIsActive(!isActive);
    mutateChildBookmarkData();
  }, [bookmarkFolders, isOpen, isActive, mutateChildBookmarkData]);

  return (
    <div id={`bookmark-folder-item-${bookmarkFolders.bookmarkFolder._id}`} className="grw-pagetree-item-container"
    >
      <li className={`list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center
       ${isActive ? 'grw-pagetree-current-page-item' : ''}`}
      >
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasChildren && (
            <button
              type="button"
              className={`grw-pagetree-triangle-btn btn ${isOpen ? 'grw-pagetree-open' : ''}`}
              onClick={onClickHandler}
            >
              <div className="d-flex justify-content-center">
                <TriangleIcon />
              </div>
            </button>
          )}
        </div>
        {
          <div>
            <i className={`fa fa ${isOpen ? 'fa-folder-open-o' : 'fa-folder-o'} pr-2` } style={{ fontSize: '1.4em' }}></i>
          </div>
        }
        {
          <div className='grw-pagetree-title-anchor flex-grow-1'>
            <p className={'text-truncate m-auto '}>{bookmarkFolders.bookmarkFolder.name}</p>
          </div>
        }
        {hasChildren && (
          <div className="grw-pagetree-count-wrapper">
            <CountBadge count={bookmarkFolders.childCount } />
          </div>
        )}

      </li>
      {
        isOpen && hasChildren && childBookmarkFolderData?.map(children => (
          <div key={children.bookmarkFolder._id} className="grw-pagetree-item-children">
            <BookmarkFolderItem
              key={children.bookmarkFolder._id}
              bookmarkFolders={children}
              isOpen = {false}
            />
          </div>
        ))
      }
    </div>
  );
};

export default BookmarkFolderItem;
