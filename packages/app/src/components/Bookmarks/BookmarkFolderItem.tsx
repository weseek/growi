import {
  FC, useCallback, useEffect, useState, useMemo,
} from 'react';

import { useTranslation } from 'next-i18next';
import { useDrag, useDrop } from 'react-dnd';
import { DropdownToggle } from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import {
  apiv3Delete, apiv3Get, apiv3Post, apiv3Put,
} from '~/client/util/apiv3-client';
import CountBadge from '~/components/Common/CountBadge';
import FolderIcon from '~/components/Icons/FolderIcon';
import TriangleIcon from '~/components/Icons/TriangleIcon';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import { IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useSWRBookmarkInfo } from '~/stores/bookmark';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';
import { usePageDeleteModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

import BookmarkFolderItemControl from './BookmarkFolderItemControl';
import BookmarkFolderNameInput from './BookmarkFolderNameInput';
import BookmarkItem from './BookmarkItem';
import DeleteBookmarkFolderModal from './DeleteBookmarkFolderModal';


type BookmarkFolderItemProps = {
  bookmarkFolder: BookmarkFolderItems
  isOpen?: boolean
  level: number
  root: string
}
const BookmarkFolderItem: FC<BookmarkFolderItemProps> = (props: BookmarkFolderItemProps) => {
  const {
    bookmarkFolder, isOpen: _isOpen = false, level, root,
  } = props;

  const { t } = useTranslation();
  const {
    name, _id: folderId, children, parent, bookmarks,
  } = bookmarkFolder;
  const [currentChildren, setCurrentChildren] = useState<BookmarkFolderItems[]>();
  const [targetFolder, setTargetFolder] = useState<string | null>(folderId);
  const [isOpen, setIsOpen] = useState(_isOpen);
  const { data: childBookmarkFolderData, mutate: mutateChildBookmarkData } = useSWRxBookamrkFolderAndChild(targetFolder);
  const { mutate: mutateParentBookmarkFolder } = useSWRxBookamrkFolderAndChild(parent);
  const [isRenameAction, setIsRenameAction] = useState<boolean>(false);
  const [isCreateAction, setIsCreateAction] = useState<boolean>(false);
  const [isDeleteFolderModalShown, setIsDeleteFolderModalShown] = useState<boolean>(false);
  const { data: currentPage } = useSWRxCurrentPage();
  const { mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(currentPage?._id);
  const { open: openDeleteModal } = usePageDeleteModal();

  const childCount = useMemo((): number => {
    if (currentChildren != null && currentChildren.length > children.length) {
      return currentChildren.length;
    }
    return children.length;
  }, [children.length, currentChildren]);

  useEffect(() => {
    if (childBookmarkFolderData != null) {
      mutateChildBookmarkData();
      setCurrentChildren(childBookmarkFolderData);
    }
  }, [childBookmarkFolderData, mutateChildBookmarkData]);

  const hasChildren = useCallback((): boolean => {
    if (currentChildren != null && currentChildren.length > children.length) {
      return currentChildren.length > 0;
    }
    return children.length > 0;
  }, [children.length, currentChildren]);

  const loadChildFolder = useCallback(async() => {
    setIsOpen(!isOpen);
    setTargetFolder(folderId);
  }, [folderId, isOpen]);

  const loadParent = useCallback(async() => {
    if (!isRenameAction) {
      if (parent != null) {
        await mutateParentBookmarkFolder();
      }
      // Reload root folder structure
      setTargetFolder(null);
    }
    else {
      await mutateParentBookmarkFolder();
    }

  }, [isRenameAction, mutateParentBookmarkFolder, parent]);

  // Rename  for bookmark folder handler
  const onPressEnterHandlerForRename = useCallback(async(folderName: string) => {
    try {
      await apiv3Put('/bookmark-folder', { bookmarkFolderId: folderId, name: folderName, parent });
      loadParent();
      setIsRenameAction(false);
      toastSuccess(t('toaster.update_successed', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, loadParent, parent, t]);

  // Create new folder / subfolder handler
  const onPressEnterHandlerForCreate = useCallback(async(folderName: string) => {
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: targetFolder });
      setIsOpen(true);
      setIsCreateAction(false);
      mutateChildBookmarkData();
      toastSuccess(t('toaster.create_succeeded', { target: t('bookmark_folder.bookmark_folder') }));

    }
    catch (err) {
      toastError(err);
    }

  }, [mutateChildBookmarkData, t, targetFolder]);

  // Delete Fodler handler
  const onClickDeleteButtonHandler = useCallback(async() => {
    try {
      await apiv3Delete(`/bookmark-folder/${folderId}`);
      setIsDeleteFolderModalShown(false);
      loadParent();
      mutateBookmarkInfo();
      toastSuccess(t('toaster.delete_succeeded', { target: t('bookmark_folder.bookmark_folder') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [folderId, loadParent, mutateBookmarkInfo, t]);

  const onClickPlusButton = useCallback(async(e) => {
    e.stopPropagation();
    if (!isOpen && hasChildren()) {
      setIsOpen(true);
    }
    setIsCreateAction(true);
  }, [hasChildren, isOpen]);

  const onClickDeleteBookmarkHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    const pageDeletedHandler : OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
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
      mutateParentBookmarkFolder();
      mutateBookmarkInfo();
    };
    openDeleteModal([pageToDelete], { onDeleted: pageDeletedHandler });
  }, [mutateBookmarkInfo, mutateParentBookmarkFolder, openDeleteModal, t]);

  const onUnbookmarkHandler = useCallback(() => {
    mutateParentBookmarkFolder();
    mutateBookmarkInfo();
  }, [mutateBookmarkInfo, mutateParentBookmarkFolder]);

  const [, drag] = useDrag({
    type: 'FOLDER',
    item:  props,
    canDrag: () => {

      return true;
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult != null) {
        console.log(dropResult);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });

  const folderItemDropHandler = async(item: BookmarkFolderItemProps) => {
    // TODO: Implement update parent folder
  };


  const isDroppable = (item: BookmarkFolderItemProps, targetRoot: string, targetLevel: number): boolean => {
    if (item.bookmarkFolder.parent === bookmarkFolder._id) {
      return false;
    }
    if (item.root === targetRoot) {
      if (item.level === level || item.level < targetLevel) {
        return false;
      }
    }
    return true;
  };

  const [, drop] = useDrop(() => ({
    accept: 'FOLDER',
    drop: folderItemDropHandler,
    hover: (item, monitor) => {
      // when a drag item is overlapped more than 1 sec, the drop target item will be opened.
      if (monitor.isOver()) {
        setTimeout(() => {
          if (monitor.isOver()) {
            setIsOpen(true);
          }
        }, 600);
      }
    },
    canDrop: (item) => {
      // Implement isDropable function & improve
      return isDroppable(item, root, level);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  const renderChildFolder = () => {
    return isOpen && currentChildren?.map((childFolder) => {
      return (
        <div key={childFolder._id} className="grw-foldertree-item-children">
          <BookmarkFolderItem
            key={childFolder._id}
            bookmarkFolder={childFolder}
            level={level + 1}
            root={root}
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
          onRenamed={mutateParentBookmarkFolder}
          onClickDeleteMenuItem={onClickDeleteBookmarkHandler}
        />
      );
    });
  };

  const onClickRenameHandler = useCallback(() => {
    setIsRenameAction(true);
  }, []);

  const onClickDeleteHandler = useCallback(() => {
    setIsDeleteFolderModalShown(true);
  }, []);

  const onDeleteFolderModalClose = useCallback(() => {
    setIsDeleteFolderModalShown(false);
  }, []);


  return (
    <div id={`grw-bookmark-folder-item-${folderId}`} className="grw-foldertree-item-container">
      <li ref={(c) => { drag(c); drop(c) }}
        className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center"
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
        { isRenameAction ? (
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
            {hasChildren() && (
              <div className="grw-foldertree-count-wrapper">
                <CountBadge count={ childCount } />
              </div>
            )}
          </>
        )

        }
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
      <DeleteBookmarkFolderModal
        bookmarkFolder={bookmarkFolder}
        isOpen={isDeleteFolderModalShown}
        onClickDeleteButton={onClickDeleteButtonHandler}
        onModalClose={onDeleteFolderModalClose}/>
    </div>
  );
};

export default BookmarkFolderItem;
