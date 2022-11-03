import {
  FC, useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
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
  const { bookmarkFolder, children } = bookmarkFolders;
  const [currentChildren, setCurrentChildren] = useState<BookmarkFolderItems[]>();
  const [isRenameInputShown, setIsRenameInputShown] = useState<boolean>(false);
  const [currentParentFolder, setCurrentParentFolder] = useState<string | null>(bookmarkFolders.bookmarkFolder?._id);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(isOpen ? currentParentFolder : null);


  useEffect(() => {
    if (isOpen && childBookmarkFolderData != null) {
      mutateChildBookmarkData();
      setCurrentChildren(childBookmarkFolderData);
    }
  }, [childBookmarkFolderData, isOpen, mutateChildBookmarkData]);

  const hasChildren = useCallback((): boolean => {
    return children.length > 0;
  }, [children.length]);


  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    updateActiveElement?.(!isOpen ? bookmarkFolder._id : null);
  }, [bookmarkFolder, isOpen, updateActiveElement]);


  const onPressEnterHandler = useCallback(async(folderName: string) => {

    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: currentParentFolder });
      setIsOpen(true);
      setIsRenameInputShown(false);
      toastSuccess(t('Create New Bookmark Folder Success'));
    }
    catch (err) {
      toastError(err);
    }

  }, [currentParentFolder, t]);

  const onClickPlusButton = useCallback(async() => {
    if (!isOpen && hasChildren()) {
      setIsOpen(true);
    }
    setIsRenameInputShown(true);
  }, [hasChildren, isOpen]);

  return (
    <div id={`bookmark-folder-item-${bookmarkFolder._id}`} className="grw-foldertree-item-container"
    >
      <li className={`list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center
       ${isActive ? 'grw-foldertree-current-folder-item' : ''}` }
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
          <div className='grw-foldertree-title-anchor flex-grow-1 pl-2' onClick={loadChildFolder}>
            <p className={'text-truncate m-auto '}>{bookmarkFolder.name}</p>
          </div>
        }
        {hasChildren() && (
          <div className="grw-foldertree-count-wrapper">
            <CountBadge count={ children.length} />
          </div>
        )}
        <div className="grw-foldertree-control d-flex">


          <button
            type="button"
            className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
            onClick={onClickPlusButton}
          >
            <i className="icon-plus d-block p-0" />
          </button>

        </div>

      </li>
      {isRenameInputShown && (
        <div className="flex-fill">
          <BookmarkFolderNameInput
            onClickOutside={() => setIsRenameInputShown(false)}
            parentFolderId={bookmarkFolder._id}
            onPressEnter={onPressEnterHandler}
          />
        </div>
      )}
      {
        isOpen && hasChildren() && currentChildren?.map(children => (
          <div key={children.bookmarkFolder._id} className="grw-foldertree-item-children">
            <BookmarkFolderItem
              key={children.bookmarkFolder._id}
              bookmarkFolders={children}
              isActive = {isActive}
            />
          </div>
        ))
      }
    </div>
  );
};

export default BookmarkFolderItem;
