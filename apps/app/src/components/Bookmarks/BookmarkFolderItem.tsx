import {
  FC, useCallback, useState,
} from 'react';

import { DropdownToggle } from 'reactstrap';

import {
  addBookmarkToFolder, addNewFolder, hasChildren, updateBookmarkFolder,
} from '~/client/util/bookmark-utils';
import { toastError } from '~/client/util/toastr';
import { FolderIcon } from '~/components/Icons/FolderIcon';
import { TriangleIcon } from '~/components/Icons/TriangleIcon';
import {
  BookmarkFolderItems, DragItemDataType, DragItemType, DRAG_ITEM_TYPE,
} from '~/interfaces/bookmark-info';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { onDeletedBookmarkFolderFunction } from '~/interfaces/ui';
import { useBookmarkFolderDeleteModal } from '~/stores/modal';

import { BookmarkFolderItemControl } from './BookmarkFolderItemControl';
import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';
import { BookmarkItem } from './BookmarkItem';
import { DragAndDropWrapper } from './DragAndDropWrapper';

type BookmarkFolderItemProps = {
  isReadOnlyUser: boolean
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
  isOperable: boolean,
  level: number
  root: string
  isUserHomePage?: boolean
  onClickDeleteBookmarkHandler: (pageToDelete: IPageToDeleteWithMeta) => void
  bookmarkFolderTreeMutation: () => void
}

export const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const BASE_FOLDER_PADDING = 15;
  const acceptedTypes: DragItemType[] = [DRAG_ITEM_TYPE.FOLDER, DRAG_ITEM_TYPE.BOOKMARK];
  const {
    isReadOnlyUser, bookmarkFolder, isOpen: _isOpen = false, isOperable, level, root, isUserHomePage,
    onClickDeleteBookmarkHandler, bookmarkFolderTreeMutation,
  } = props;

  const {
    name, _id: folderId, children, parent, bookmarks,
  } = bookmarkFolder;

  const [targetFolder, setTargetFolder] = useState<string | null>(folderId);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const [isRenameAction, setIsRenameAction] = useState<boolean>(false);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);

  const { open: openDeleteBookmarkFolderModal } = useBookmarkFolderDeleteModal();

  const childrenExists = hasChildren(children);

  const paddingLeft = BASE_FOLDER_PADDING * level;

  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    setTargetFolder(folderId);
  }, [folderId, isOpen]);

  // Rename for bookmark folder handler
  const onPressEnterHandlerForRename = useCallback(async(folderName: string) => {
    try {
      await updateBookmarkFolder(folderId, folderName, parent);
      bookmarkFolderTreeMutation();
      setIsRenameAction(false);
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkFolderTreeMutation, folderId, parent]);

  // Create new folder / subfolder handler
  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await addNewFolder(folderName, targetFolder);
      setIsOpen(true);
      setIsCreateAction(false);
      bookmarkFolderTreeMutation();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkFolderTreeMutation, targetFolder]);

  const onClickPlusButton = useCallback(async(e) => {
    e.stopPropagation();
    if (!isOpen && childrenExists) {
      setIsOpen(true);
    }
    setIsCreateAction(true);
  }, [childrenExists, isOpen]);

  const itemDropHandler = async(item: DragItemDataType, dragItemType: string | symbol | null) => {
    if (dragItemType === DRAG_ITEM_TYPE.FOLDER) {
      try {
        if (item.bookmarkFolder != null) {
          await updateBookmarkFolder(item.bookmarkFolder._id, item.bookmarkFolder.name, bookmarkFolder._id);
          bookmarkFolderTreeMutation();
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
          bookmarkFolderTreeMutation();
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
            isReadOnlyUser={isReadOnlyUser}
            isOperable={props.isOperable}
            bookmarkFolder={childFolder}
            level={level + 1}
            root={root}
            isUserHomePage={isUserHomePage}
            onClickDeleteBookmarkHandler={onClickDeleteBookmarkHandler}
            bookmarkFolderTreeMutation={bookmarkFolderTreeMutation}
          />
        </div>
      );
    });
  };

  const renderBookmarkItem = () => {
    return isOpen && bookmarks?.map((bookmark) => {
      return (
        <BookmarkItem
          key={bookmark._id}
          isReadOnlyUser={isReadOnlyUser}
          isOperable={props.isOperable}
          bookmarkedPage={bookmark.page}
          level={level + 1}
          parentFolder={bookmarkFolder}
          canMoveToRoot={true}
          onClickDeleteBookmarkHandler={onClickDeleteBookmarkHandler}
          bookmarkFolderTreeMutation={bookmarkFolderTreeMutation}
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
      bookmarkFolderTreeMutation();
    };

    if (bookmarkFolder == null) {
      return;
    }
    openDeleteBookmarkFolderModal(bookmarkFolder, { onDeleted: bookmarkFolderDeleteHandler });
  }, [bookmarkFolder, bookmarkFolderTreeMutation, openDeleteBookmarkFolderModal]);

  const onClickMoveToRootHandlerForBookmarkFolderItemControl = useCallback(async() => {
    try {
      await updateBookmarkFolder(bookmarkFolder._id, bookmarkFolder.name, null);
      bookmarkFolderTreeMutation();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkFolder._id, bookmarkFolder.name, bookmarkFolderTreeMutation]);

  return (
    <div id={`grw-bookmark-folder-item-${folderId}`} className="grw-foldertree-item-container">
      <DragAndDropWrapper
        key={folderId}
        type={acceptedTypes}
        item={props}
        useDragMode={isOperable}
        useDropMode={isOperable}
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
          { isOperable && (
            <div className="grw-foldertree-control d-flex">
              <BookmarkFolderItemControl
                onClickRename={onClickRenameHandler}
                onClickDelete={onClickDeleteHandler}
                onClickMoveToRoot={bookmarkFolder.parent != null
                  ? onClickMoveToRootHandlerForBookmarkFolderItemControl
                  : undefined
                }
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
          )}
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
