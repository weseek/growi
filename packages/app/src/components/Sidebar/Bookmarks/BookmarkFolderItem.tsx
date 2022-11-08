import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import CountBadge from '~/components/Common/CountBadge';
import FolderIcon from '~/components/Icons/FolderIcon';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';


type BookmarkFolderItemProps = {
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const {
    bookmarkFolder, isOpen: _isOpen = false,
  } = props;
  const { t } = useTranslation();
  const [currentParentFolder, setCurrentParentFolder] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(isOpen, currentParentFolder);
  const { name, _id: parentId, children } = bookmarkFolder;

  const hasChildren = useCallback((): boolean => {
    if (children != null) {
      return children.length > 0;
    }
    return false;
  }, [children]);

  useEffect(() => {
    setCurrentParentFolder(parentId);
  }, [bookmarkFolder, parentId]);

  const loadChildFolder = useCallback(async() => {
    setCurrentParentFolder(parentId);
    setIsOpen(!isOpen);
    mutateChildBookmarkData();
  }, [parentId, isOpen, mutateChildBookmarkData]);


  return (
    <div id={`bookmark-folder-item-${bookmarkFolder._id}`} className="grw-foldertree-item-container"
    >
      <li className='list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center'
        onClick={loadChildFolder}
      >
        <div className="grw-triangle-container d-flex justify-content-center">
          {hasChildren() && (
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
            <FolderIcon isOpen={isOpen} />
          </div>
        }
        {
          <div className='grw-foldertree-title-anchor flex-grow-1 pl-2'>
            <p className={'text-truncate m-auto '}>{name}</p>
          </div>
        }
        {hasChildren() && (
          <div className="grw-foldertree-count-wrapper">
            <CountBadge count={ children.length} />
          </div>
        )}

      </li>
      {
        isOpen && hasChildren() && childBookmarkFolderData?.map(children => (
          <div key={children._id} className="grw-foldertree-item-children">
            <BookmarkFolderItem
              key={children._id}
              bookmarkFolder={children}
              isOpen = {false}
            />
          </div>
        ))
      }
    </div>
  );
};

export default BookmarkFolderItem;
