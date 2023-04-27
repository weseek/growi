import {
  FC, useCallback, useState,
} from 'react';

import type { IPageHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { DropdownToggle } from 'reactstrap';
import type { KeyedMutator } from 'swr';

import {
  addBookmarkToFolder, addNewFolder, hasChildren, updateBookmarkFolder,
} from '~/client/util/bookmark-utils';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { FolderIcon } from '~/components/Icons/FolderIcon';
import { TriangleIcon } from '~/components/Icons/TriangleIcon';
import {
  BookmarkFolderItems, DragItemDataType, DragItemType, DRAG_ITEM_TYPE, IBookmarkInfo,
} from '~/interfaces/bookmark-info';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { onDeletedBookmarkFolderFunction, OnDeletedFunction } from '~/interfaces/ui';
import { useBookmarkFolderDeleteModal, usePageDeleteModal } from '~/stores/modal';

import { BookmarkFolderItemControl } from './BookmarkFolderItemControl';
import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';
import { BookmarkItem } from './BookmarkItem';
import { DragAndDropWrapper } from './DragAndDropWrapper';

type BookmarkFolderItemProps = {
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
  level: number
  root: string
  isUserHomePage?: boolean
  bookmarkFolders: BookmarkFolderItems[]
  mutateBookmarkFolders: KeyedMutator<BookmarkFolderItems[]>
  userBookmarks: IPageHasId[]
  mutateUserBookmarks: KeyedMutator<IPageHasId[]>
  bookmarkInfo: IBookmarkInfo
  mutateBookmarkInfo: KeyedMutator<IBookmarkInfo>
}

export const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const BASE_FOLDER_PADDING = 15;
  const acceptedTypes: DragItemType[] = [DRAG_ITEM_TYPE.FOLDER, DRAG_ITEM_TYPE.BOOKMARK];
  const {
    bookmarkFolder, isOpen: _isOpen = false, level, root, isUserHomePage, bookmarkFolders,
    mutateBookmarkFolders, userBookmarks, mutateUserBookmarks, bookmarkInfo, mutateBookmarkInfo,
  } = props;

  const { t } = useTranslation();
  const {
    name, _id: folderId, children, parent, bookmarks,
  } = bookmarkFolder;

  const [targetFolder, setTargetFolder] = useState<string | null>(folderId);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isRenameAction, setIsRenameAction] = useState<boolean>(false);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);


  const { open: openDeleteModal } = usePageDeleteModal();
  const { open: openDeleteBookmarkFolderModal } = useBookmarkFolderDeleteModal();

  const childrenExists = hasChildren(children);

  const paddingLeft = BASE_FOLDER_PADDING * level;

  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    setTargetFolder(folderId);
  }, [folderId, isOpen]);

  // Rename  for bookmark folder handler
  const onPressEnterHandlerForRename = useCallback(async(folderName: string) => {
    try {
      await updateBookmarkFolder(folderId, folderName, parent);
      mutateBookmarkFolders();
      setIsRenameAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, mutateBookmarkFolders, parent]);

  // Create new folder / subfolder handler
  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, targetFolder);
      setIsOpen(true);
      setIsCreateAction(false);
      mutateBookmarkFolders();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkFolders, targetFolder]);


  const onClickPlusButton = useCallback(async(e) => {
    e.stopPropagation();
    if (!isOpen && childrenExists) {
      setIsOpen(true);
    }
    setIsCreateAction(true);
  }, [childrenExists, isOpen]);

  const onClickDeleteBookmarkHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const pageDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') {
        return;
      }
      const path = pathOrPathsToDelete;

      if (isCompletely) {
        toastSuccess(t('deleted_pages_completely', { path }));
      }
      else {
        toastSuccess(t('deleted_pages', { path }));
      }
      mutateBookmarkFolders();
      mutateBookmarkInfo();
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [mutateBookmarkInfo, mutateBookmarkFolders, openDeleteModal, t]);

  const onUnbookmarkHandler = useCallback(() => {
    mutateBookmarkFolders();
    mutateBookmarkInfo();
  }, [mutateBookmarkInfo, mutateBookmarkFolders]);


  const itemDropHandler = async(item: DragItemDataType, dragItemType: string | symbol | null) => {
    if (dragItemType === DRAG_ITEM_TYPE.FOLDER) {
      try {
        if (item.bookmarkFolder != null) {
          await updateBookmarkFolder(item.bookmarkFolder._id, item.bookmarkFolder.name, bookmarkFolder._id);
          mutateBookmarkFolders();
        }
      }
      catch (err) {
        toastError(err);
      }
    }
    else {
      try {
        if (item != null) {
          await addBookmarkToFolder(item._id, bookmarkFolder._id);
          mutateBookmarkFolders();
          await mutateUserBookmarks();
        }
      }
      catch (err) {
        toastError(err);
      }
    }
  };

  const isDropable = (item: DragItemDataType, type: string | null| symbol): boolean => {
    if (type === DRAG_ITEM_TYPE.FOLDER) {
      if (item.bookmarkFolder.parent === bookmarkFolder._id || item.bookmarkFolder._id === bookmarkFolder._id) {
        return false;
      }

      // Maximum folder hierarchy of 2 levels
      // If the drop source folder has child folders, the drop source folder cannot be moved because the drop source folder hierarchy is already 2.
      // If the destination folder has a parent, the source folder cannot be moved because the destination folder hierarchy is already 2.
      if (item.bookmarkFolder.children.length !== 0 || bookmarkFolder.parent != null) {
        return false;
      }

      return item.root !== root || item.level >= level;
    }

    if (item.parentFolder != null && item.parentFolder._id === bookmarkFolder._id) {
      return false;
    }
    return true;
  };


  const renderChildFolder = () => {
    return isOpen && children?.map((childFolder) => {
      return (
        <div key={childFolder._id} className="grw-foldertree-item-children">
          <BookmarkFolderItem
            key={childFolder._id}
            bookmarkFolder={childFolder}
            level={level + 1}
            root={root}
            isUserHomePage={isUserHomePage}
            bookmarkFolders={bookmarkFolders}
            mutateBookmarkFolders={mutateBookmarkFolders}
            userBookmarks={userBookmarks}
            mutateUserBookmarks={mutateUserBookmarks}
            bookmarkInfo={bookmarkInfo}
            mutateBookmarkInfo={mutateBookmarkInfo}
          />
        </div>
      );
    });
  };

  const renderBookmarkItem = () => {
    return isOpen && bookmarks?.map((bookmark) => {
      return (
        <BookmarkItem
          bookmarkedPage={bookmark.page}
          key={bookmark._id}
          onUnbookmarked={onUnbookmarkHandler}
          onRenamed={mutateBookmarkFolders}
          onClickDeleteMenuItem={onClickDeleteBookmarkHandler}
          parentFolder={bookmarkFolder}
          level={level + 1}
          bookmarkFolders={bookmarkFolders}
          mutateBookmarkFolders={mutateBookmarkFolders}
          userBookmarks={userBookmarks}
          mutateUserBookmarks={mutateUserBookmarks}
        />
      );
    });
  };

  const onClickRenameHandler = useCallback(() => {
    setIsRenameAction(true);
  }, []);

  const onClickDeleteHandler = useCallback(() => {
    const bookmarkFolderDeleteHandler: onDeletedBookmarkFolderFunction = (folderId) => {
      if (typeof folderId !== 'string') {
        return;
      }
      mutateBookmarkInfo();
      mutateBookmarkFolders();
    };

    if (bookmarkFolder == null) {
      return;
    }
    openDeleteBookmarkFolderModal(bookmarkFolder, { onDeleted: bookmarkFolderDeleteHandler });
  }, [bookmarkFolder, mutateBookmarkFolders, mutateBookmarkInfo, openDeleteBookmarkFolderModal]);

  const onClickMoveToRootHandler = useCallback(async() => {
    try {
      await updateBookmarkFolder(bookmarkFolder._id, bookmarkFolder.name, null);
      await mutateBookmarkFolders();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkFolder._id, bookmarkFolder.name, mutateBookmarkFolders]);

  return (
    <div id={`grw-bookmark-folder-item-${folderId}`} className="grw-foldertree-item-container">
      <DragAndDropWrapper
        key={folderId}
        type={acceptedTypes}
        item={props}
        useDragMode={true}
        useDropMode={true}
        onDropItem={itemDropHandler}
        isDropable={isDropable}
      >
        <li
          className={'list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center'}
          onClick={loadChildFolder}
          style={{ paddingLeft }}
        >
          <div className="grw-triangle-container d-flex justify-content-center">
            {childrenExists && (
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
          {isRenameAction ? (
            <BookmarkFolderNameInput
              onClickOutside={() => setIsRenameAction(false)}
              onPressEnter={onPressEnterHandlerForRename}
              value={name}
            />
          ) : (
            <>
              <div className='grw-foldertree-title-anchor pl-2' >
                <p className={'text-truncate m-auto '}>{name}</p>
              </div>
            </>
          )}
          <div className="grw-foldertree-control d-flex">
            <BookmarkFolderItemControl
              onClickRename={onClickRenameHandler}
              onClickDelete={onClickDeleteHandler}
              onClickMoveToRoot={onClickMoveToRootHandler}
              isMoveToRoot={bookmarkFolder.parent != null}
            >
              <div onClick={e => e.stopPropagation()}>
                <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
                  <i className="icon-options fa fa-rotate-90 p-1"></i>
                </DropdownToggle>
              </div>
            </BookmarkFolderItemControl>
            {/* Maximum folder hierarchy of 2 levels */}
            {!(bookmarkFolder.parent != null) && (
              <button
                id='create-bookmark-folder-button'
                type="button"
                className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
                onClick={onClickPlusButton}
              >
                <i className="icon-plus d-block p-0" />
              </button>
            )}
          </div>
        </li>
      </DragAndDropWrapper>
      {isCreateAction && (
        <div className="flex-fill">
          <BookmarkFolderNameInput
            onClickOutside={() => setIsCreateAction(false)}
            onPressEnter={onPressEnterHandlerForCreate}
          />
        </div>
      )}
      {
        renderChildFolder()
      }
      {
        renderBookmarkItem()
      }
    </div>
  );
};
