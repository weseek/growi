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
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const { bookmarkFolder, isOpen: _isOpen = false } = props;

  const { t } = useTranslation();
  const { name, _id: parentId, children } = bookmarkFolder;
  const [currentChildren, setCurrentChildren] = useState<BookmarkFolderItems[]>();
  const [isRenameInputShown, setIsRenameInputShown] = useState<boolean>(false);
  const [currentParentFolder, setCurrentParentFolder] = useState<string | null>(parentId);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(isOpen ? currentParentFolder : null);


  const childCount = useCallback((): number => {
    if (currentChildren != null && currentChildren.length > children.length) {
      return currentChildren.length;
    }
    return children.length;
  }, [children.length, currentChildren]);

  useEffect(() => {
    if (isOpen && childBookmarkFolderData != null) {
      mutateChildBookmarkData();
      setCurrentChildren(childBookmarkFolderData);
    }
  }, [childBookmarkFolderData, isOpen, mutateChildBookmarkData]);

  const hasChildren = useCallback((): boolean => {
    if (currentChildren != null && currentChildren.length > children.length) {
      return currentChildren.length > 0;
    }
    return children.length > 0;
  }, [children.length, currentChildren]);


  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    setCurrentParentFolder(bookmarkFolder._id);
  }, [bookmarkFolder, isOpen]);


  const onPressEnterHandler = useCallback(async(folderName: string) => {

    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: currentParentFolder });
      setIsOpen(true);
      setIsRenameInputShown(false);
      mutateChildBookmarkData();
      toastSuccess(t('Create New Bookmark Folder Success'));
    }
    catch (err) {
      toastError(err);
    }

  }, [currentParentFolder, mutateChildBookmarkData, t]);

  const onClickPlusButton = useCallback(async() => {
    if (!isOpen && hasChildren()) {
      setIsOpen(true);
    }
    setIsRenameInputShown(true);
  }, [hasChildren, isOpen]);

  const RenderChildFolder = () => {
    return isOpen && currentChildren?.map((childFolder) => {
      return (
        <div key={childFolder._id} className="grw-foldertree-item-children">
          <BookmarkFolderItem
            key={childFolder._id}
            bookmarkFolder={childFolder}
          />
        </div>
      );
    });
  };


  return (
    <div id={`bookmark-folder-item-${bookmarkFolder._id}`} className="grw-foldertree-item-container"
    >
      <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center">
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
            <p className={'text-truncate m-auto '}>{name}</p>
          </div>
        }
        {hasChildren() && (
          <div className="grw-foldertree-count-wrapper">
            <CountBadge count={ childCount() } />
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
            onPressEnter={onPressEnterHandler}
          />
        </div>
      )}
      {
        RenderChildFolder()
      }
    </div>
  );
};

export default BookmarkFolderItem;
