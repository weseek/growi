import {
  FC, useCallback, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownToggle } from 'reactstrap';

import {
  addBookmarkToFolder, addNewFolder, hasChildren, updateBookmarkFolder,
} from '~/client/util/bookmark-utils';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { FolderIcon } from '~/components/Icons/FolderIcon';
import { TriangleIcon } from '~/components/Icons/TriangleIcon';
import {
  BookmarkFolderItems, DragItemDataType, DragItemType, DRAG_ITEM_TYPE,
} from '~/interfaces/bookmark-info';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { onDeletedBookmarkFolderFunction, OnDeletedFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useBookmarkFolderDeleteModal, usePageDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

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
}

export const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const BASE_FOLDER_PADDING = 15;
  const acceptedTypes: DragItemType[] = [DRAG_ITEM_TYPE.FOLDER, DRAG_ITEM_TYPE.BOOKMARK];
  const {
    bookmarkFolder, isOpen: _isOpen = false, level, root, isUserHomePage,
  } = props;

  const { t } = useTranslation();
  const {
    name, _id: folderId, children, parent, bookmarks,
  } = bookmarkFolder;

  const [targetFolder, setTargetFolder] = useState<string | null>(folderId);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { mutate: mutateBookmarkData } = useSWRxBookamrkFolderAndChild();
  const { mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const [isRenameAction, setIsRenameAction] = useState<boolean>(false);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
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
      mutateBookmarkData();
      setIsRenameAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, mutateBookmarkData, parent]);

  // Create new folder / subfolder handler
  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, targetFolder);
      setIsOpen(true);
      setIsCreateAction(false);
      mutateBookmarkData();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateBookmarkData, targetFolder]);


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
      mutateBookmarkData();
      mutateBookmarkInfo();
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [mutateBookmarkInfo, mutateBookmarkData, openDeleteModal, t]);

  const onUnbookmarkHandler = useCallback(() => {
    mutateBookmarkData();
    mutateBookmarkInfo();
  }, [mutateBookmarkInfo, mutateBookmarkData]);


  const itemDropHandler = async(item: DragItemDataType, dragItemType: string | symbol | null) => {
    if (dragItemType === DRAG_ITEM_TYPE.FOLDER) {
      try {
        if (item.bookmarkFolder != null) {
          await updateBookmarkFolder(item.bookmarkFolder._id, item.bookmarkFolder.name, bookmarkFolder._id);
          mutateBookmarkData();
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
          mutateBookmarkData();
          await mutateUserBookmarks();
        }
      }
      catch (err) {
        toastError(err);
      }
    }
  };

  const isDroppable = (item: DragItemDataType, type: string | null| symbol): boolean => {
    if (type === DRAG_ITEM_TYPE.FOLDER) {
      if (item.bookmarkFolder.parent === bookmarkFolder._id || item.bookmarkFolder._id === bookmarkFolder._id) {
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
            isUserHomePage ={isUserHomePage}
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
          onRenamed={mutateBookmarkData}
          onClickDeleteMenuItem={onClickDeleteBookmarkHandler}
          parentFolder={bookmarkFolder}
          level={level + 1}
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
      mutateBookmarkData();
    };

    if (bookmarkFolder == null) {
      return;
    }
    openDeleteBookmarkFolderModal(bookmarkFolder, { onDeleted: bookmarkFolderDeleteHandler });
  }, [bookmarkFolder, mutateBookmarkData, mutateBookmarkInfo, openDeleteBookmarkFolderModal]);


  return (
    <div id={`grw-bookmark-folder-item-${folderId}`} className="grw-foldertree-item-container">
      <DragAndDropWrapper
        key={folderId}
        type={acceptedTypes}
        item={props}
        useDragMode={true}
        useDropMode={true}
        onDropItem={itemDropHandler}
        isDropable={isDroppable}
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
            >
              <div onClick={e => e.stopPropagation()}>
                <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
                  <i className="icon-options fa fa-rotate-90 p-1"></i>
                </DropdownToggle>
              </div>
            </BookmarkFolderItemControl>
            <button
              type="button"
              className="border-0 rounded btn btn-page-item-control p-0 grw-visible-on-hover"
              onClick={onClickPlusButton}
            >
              <i className="icon-plus d-block p-0" />
            </button>
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
