import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import CountBadge from '~/components/Common/CountBadge';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';


type BookmarkFolderItemProps = {
  bookmarkFolders: BookmarkFolderItems
  isOpen?: boolean
  updateActiveElement?: (parentId: string | null) => void
  isActive?: boolean
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const {
    bookmarkFolders, isOpen: _isOpen = false, updateActiveElement, isActive,
  } = props;
  const { t } = useTranslation();
  const hasChildren = bookmarkFolders.children.length > 0;
  const [currentParentFolder, setCurrentParentFolder] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(isOpen, currentParentFolder);

  useEffect(() => {
    setCurrentParentFolder(bookmarkFolders.bookmarkFolder._id);
  }, [bookmarkFolders]);

  const loadChildFolder = useCallback(async() => {
    setCurrentParentFolder(bookmarkFolders.bookmarkFolder._id);
    setIsOpen(!isOpen);
    updateActiveElement?.(!isOpen ? bookmarkFolders.bookmarkFolder._id : null);
    mutateChildBookmarkData();
  }, [bookmarkFolders, isOpen, updateActiveElement, mutateChildBookmarkData]);


  return (
    <div id={`bookmark-folder-item-${bookmarkFolders.bookmarkFolder._id}`} className="grw-foldertree-item-container"
    >
      <li className={`list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center
       ${isActive ? 'grw-foldertree-current-folder-item' : ''}` }
      onClick={loadChildFolder}
      >
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasChildren && (
            <button
              type="button"
              className={`grw-foldertree-triangle-btn btn ${isOpen ? 'grw-foldertree-open' : ''}`}
              onClick={loadChildFolder}
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
          <div className='grw-foldertree-title-anchor flex-grow-1'>
            <p className={'text-truncate m-auto '}>{bookmarkFolders.bookmarkFolder.name}</p>
          </div>
        }
        {hasChildren && (
          <div className="grw-foldertree-count-wrapper">
            <CountBadge count={ bookmarkFolders.children.length} />
          </div>
        )}

      </li>
      {
        isOpen && hasChildren && childBookmarkFolderData?.map(children => (
          <div key={children.bookmarkFolder._id} className="grw-foldertree-item-children">
            <BookmarkFolderItem
              key={children.bookmarkFolder._id}
              bookmarkFolders={children}
              isOpen = {false}
              isActive = {isActive}
            />
          </div>
        ))
      }
    </div>
  );
};

export default BookmarkFolderItem;
