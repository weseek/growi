import {
  FC, useCallback, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import { useDrag, useDrop } from 'react-dnd';
import { DropdownToggle } from 'reactstrap';

import { apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { FolderIcon } from '~/components/Icons/FolderIcon';
import { TriangleIcon } from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems, DragItemType, DRAG_ITEM_TYPE } from '~/interfaces/bookmark-info';
import { IPageHasId, IPageToDeleteWithMeta } from '~/interfaces/page';
import { onDeletedBookmarkFolderFunction, OnDeletedFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo, useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { useBookmarkFolderDeleteModal, usePageDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import { BookmarkFolderItemControl } from './BookmarkFolderItemControl';
import { BookmarkFolderNameInput } from './BookmarkFolderNameInput';
import { BookmarkItem } from './BookmarkItem';


type BookmarkFolderItemProps = {
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
  level: number
  root: string
  isUserHomePage?: boolean
}

type DragItemDataType = {
  parentFolder: BookmarkFolderItems
} & BookmarkFolderItemProps & IPageHasId

export const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
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

  const hasChildren = useCallback((): boolean => {
    return children != null && children.length > 0;
  }, [children]);

  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    setTargetFolder(folderId);
  }, [folderId, isOpen]);

  // Rename  for bookmark folder handler
  const onPressEnterHandlerForRename = useCallback(async(folderName: string) => {
    try {
      await apiv3Put('/bookmark-folder', { bookmarkFolderId: folderId, name: folderName, parent });
      mutateBookmarkData();
      setIsRenameAction(false);
      toastSuccess(t('toaster.update_successed', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, mutateBookmarkData, parent, t]);

  // Create new folder / subfolder handler
  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: targetFolder });
      setIsOpen(true);
      setIsCreateAction(false);
      mutateBookmarkData();
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));

    }
    catch (err) {
      toastError(err);
    }

  }, [mutateBookmarkData, t, targetFolder]);


  const onClickPlusButton = useCallback(async(e) => {
    e.stopPropagation();
    if (!isOpen && hasChildren()) {
      setIsOpen(true);
    }
    setIsCreateAction(true);
  }, [hasChildren, isOpen]);

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

  const [, bookmarkFolderDragRef] = useDrag({
    type: DRAG_ITEM_TYPE.FOLDER,
    item: props,
    end: (_item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult != null) {
        mutateBookmarkData();
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });


  const itemDropHandler = async(item: DragItemDataType, dragItemType: string | symbol | null) => {
    if (dragItemType === DRAG_ITEM_TYPE.FOLDER) {
      try {
        await apiv3Put('/bookmark-folder', { bookmarkFolderId: item.bookmarkFolder._id, name: item.bookmarkFolder.name, parent: bookmarkFolder._id });
        mutateBookmarkData();
        toastSuccess(t('toaster.update_successed', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
      }
      catch (err) {
        toastError(err);
      }
    }
    else {
      try {
        await apiv3Post('/bookmark-folder/add-boookmark-to-folder', { pageId: item._id, folderId: bookmarkFolder._id });
        mutateBookmarkData();
        await mutateUserBookmarks();
        toastSuccess(t('toaster.add_succeeded', { target: t('bookmark_folder.bookmark'), ns: 'commons' }));
      }
      catch (err) {
        toastError(err);
      }
    }
  };

  const isDroppable = (item: DragItemDataType, targetRoot: string, targetLevel: number, type: string | null| symbol): boolean => {
    if (type === DRAG_ITEM_TYPE.FOLDER) {
      if (item.bookmarkFolder.parent === bookmarkFolder._id || item.bookmarkFolder._id === bookmarkFolder._id) {
        return false;
      }
      return item.root !== targetRoot || item.level >= targetLevel;
    }

    if (item.parentFolder != null && item.parentFolder._id === bookmarkFolder._id) {
      return false;
    }
    return true;
  };

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: acceptedTypes,
    drop: (item: DragItemDataType, monitor) => {
      const itemType = monitor.getItemType();
      itemDropHandler(item, itemType);
    },
    canDrop: (item: DragItemDataType, monitor) => {
      const itemType = monitor.getItemType();
      return isDroppable(item, root, level, itemType);
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  }));


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
      toastSuccess(t('toaster.delete_succeeded', { target: t('bookmark_folder.bookmark_folder'), ns: 'commons' }));
    };

    if (bookmarkFolder == null) {
      return;
    }
    openDeleteBookmarkFolderModal(bookmarkFolder, { onDeleted: bookmarkFolderDeleteHandler });
  }, [bookmarkFolder, mutateBookmarkData, mutateBookmarkInfo, openDeleteBookmarkFolderModal, t]);


  return (
    <div id={`grw-bookmark-folder-item-${folderId}`} className="grw-foldertree-item-container">
      <li ref={(c) => { bookmarkFolderDragRef(c); dropRef(c) }}
        className={`${isOver ? 'grw-accept-drop-item' : ''} list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center`}
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
