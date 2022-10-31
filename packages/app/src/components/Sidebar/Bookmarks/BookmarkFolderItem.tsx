import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import CountBadge from '~/components/Common/CountBadge';
import FolderIcon from '~/components/Icons/FolderIcon';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';

import BookmarkFolderNameInput from './BookmarkFolderNameInput';


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
  const [isRenameInputShown, setIsRenameInputShown] = useState<boolean>(false);
  const hasChildren = bookmarkFolders.children.length > 0;
  const [currentParentFolder, setCurrentParentFolder] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(isOpen, currentParentFolder);
  const [folderName, setFolderName] = useState<string>('');

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
            <FolderIcon isOpen={isOpen} />
          </div>
        }
        {
          <div className='grw-foldertree-title-anchor flex-grow-1 pl-2'>
            <p className={'text-truncate m-auto '}>{bookmarkFolders.bookmarkFolder.name}</p>
          </div>
        }
        {hasChildren && (
          <div className="grw-foldertree-count-wrapper">
            <CountBadge count={ bookmarkFolders.children.length} />
          </div>
        )}
        <div className="grw-foldertree-control d-flex">


          <button
            type="button"
            className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
            onClick={() => setIsRenameInputShown(true)}
          >
            <i className="icon-plus d-block p-0" />
          </button>

        </div>

      </li>
      {isRenameInputShown && (
        <div className="flex-fill">
          <BookmarkFolderNameInput
            onClickOutside={() => setIsRenameInputShown(false)}
          />
        </div>
      )}
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
