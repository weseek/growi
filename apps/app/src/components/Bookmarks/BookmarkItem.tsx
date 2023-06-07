import React, { useCallback, useState } from 'react';

import nodePath from 'path';

import { DevidedPagePath, pathUtils } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';


import { bookmark, unbookmark, unlink } from '~/client/services/page-operation';
import { addBookmarkToFolder, renamePage } from '~/client/util/bookmark-utils';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { BookmarkFolderItems, DragItemDataType, DRAG_ITEM_TYPE } from '~/interfaces/bookmark-info';
import { IPageHasId, IPageInfoAll, IPageToDeleteWithMeta } from '~/interfaces/page';
import { mutateAllPageInfo, useSWRxCurrentPage, useSWRxPageInfo } from '~/stores/page';

import ClosableTextInput from '../Common/ClosableTextInput';
import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';
import { PageListItemS } from '../PageList/PageListItemS';

import { BookmarkMoveToRootBtn } from './BookmarkMoveToRootBtn';
import { DragAndDropWrapper } from './DragAndDropWrapper';
import { OnPutBackedFunction } from '~/interfaces/ui';
import { usePutBackPageModal } from '~/stores/modal';
import { useRouter } from 'next/router';

type Props = {
  isReadOnlyUser: boolean
  isOperable: boolean,
  bookmarkedPage: IPageHasId,
  level: number,
  parentFolder: BookmarkFolderItems | null,
  canMoveToRoot: boolean,
  onClickDeleteMenuItemHandler: (pageToDelete: IPageToDeleteWithMeta) => void,
  bookmarkFolderTreeMutation: () => void,
  onPagePutBacked?: OnPutBackedFunction,
}

export const BookmarkItem = (props: Props): JSX.Element => {
  const BASE_FOLDER_PADDING = 15;
  const BASE_BOOKMARK_PADDING = 20;

  const { t } = useTranslation();
  const router = useRouter();

  const {
    isReadOnlyUser, isOperable, bookmarkedPage, onClickDeleteMenuItemHandler,
    parentFolder, level, canMoveToRoot, bookmarkFolderTreeMutation, onPagePutBacked,
  } = props;
  const { open: openPutBackPageModal } = usePutBackPageModal();
  const [isRenameInputShown, setRenameInputShown] = useState(false);

  const { data: pageInfo, mutate: mutatePageInfo } = useSWRxPageInfo(bookmarkedPage._id);
  const { data: currentPage } = useSWRxCurrentPage();

  const dPagePath = new DevidedPagePath(bookmarkedPage.path, false, true);
  const { latter: pageTitle, former: formerPagePath } = dPagePath;
  const bookmarkItemId = `bookmark-item-${bookmarkedPage._id}`;
  const paddingLeft = BASE_BOOKMARK_PADDING + (BASE_FOLDER_PADDING * (level + 1));
  const dragItem: Partial<DragItemDataType> = {
    ...bookmarkedPage, parentFolder,
  };

  const onClickMoveToRootHandler = useCallback(async() => {
    try {
      await addBookmarkToFolder(bookmarkedPage._id, null);
      bookmarkFolderTreeMutation();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkFolderTreeMutation, bookmarkedPage._id]);

  const bookmarkMenuItemClickHandler = useCallback(async(pageId: string, shouldBookmark: boolean) => {
    if (shouldBookmark) {
      await bookmark(pageId);
    }
    else {
      await unbookmark(pageId);
    }
    bookmarkFolderTreeMutation();
    mutatePageInfo();
  }, [bookmarkFolderTreeMutation, mutatePageInfo]);

  const renameMenuItemClickHandler = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const pressEnterForRenameHandler = useCallback(async(inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(bookmarkedPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);
    if (newPagePath === bookmarkedPage.path) {
      setRenameInputShown(false);
      return;
    }

    try {
      setRenameInputShown(false);
      await renamePage(bookmarkedPage._id, bookmarkedPage.revision, newPagePath);
      bookmarkFolderTreeMutation();
      mutatePageInfo();
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  }, [bookmarkedPage.path, bookmarkedPage._id, bookmarkedPage.revision, bookmarkFolderTreeMutation, mutatePageInfo]);

  const deleteMenuItemClickHandler = useCallback(async(_pageId: string, pageInfo: IPageInfoAll | undefined): Promise<void> => {
    if (bookmarkedPage._id == null || bookmarkedPage.path == null) {
      throw Error('_id and path must not be null.');
    }

    const pageToDelete: IPageToDeleteWithMeta = {
      data: {
        _id: bookmarkedPage._id,
        revision: bookmarkedPage.revision as string,
        path: bookmarkedPage.path,
      },
      meta: pageInfo,
    };

    onClickDeleteMenuItemHandler(pageToDelete);
  }, [bookmarkedPage._id, bookmarkedPage.path, bookmarkedPage.revision, onClickDeleteMenuItemHandler]);

  const putBackClickHandler = useCallback(async() => {
    const { _id: pageId, path } = bookmarkedPage;
    const putBackedHandler = async() => {
      try {
        await unlink(path);
        mutateAllPageInfo();
        bookmarkFolderTreeMutation();
        if (pageId === currentPage?._id) {
          router.push(`/${pageId}`);
        }
        toastSuccess(t('page_has_been_reverted', { path }));
      }
      catch (err) {
        toastError(err);
      }
      if (onPagePutBacked != null) {
        onPagePutBacked(path);
      }
    };
    openPutBackPageModal({ pageId, path }, { onPutBacked: putBackedHandler });

  }, [bookmarkedPage, openPutBackPageModal, mutateAllPageInfo, bookmarkFolderTreeMutation, router]);

  return (
    <DragAndDropWrapper
      item={dragItem}
      type={[DRAG_ITEM_TYPE.BOOKMARK]}
      useDragMode={isOperable}
    >
      <li
        className="grw-bookmark-item-list list-group-item list-group-item-action border-0 py-0 mr-auto d-flex align-items-center"
        key={bookmarkedPage._id}
        id={bookmarkItemId}
        style={{ paddingLeft }}
      >
        {isRenameInputShown ? (
          <ClosableTextInput
            value={nodePath.basename(bookmarkedPage.path ?? '')}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={pressEnterForRenameHandler}
            validationTarget={ValidationTarget.PAGE}
          />
        ) : <PageListItemS page={bookmarkedPage} pageTitle={pageTitle} />}

        <div className='grw-foldertree-control'>
          <PageItemControl
            pageId={bookmarkedPage._id}
            isEnableActions
            isReadOnlyUser={isReadOnlyUser}
            pageInfo={pageInfo}
            forceHideMenuItems={[MenuItemType.DUPLICATE]}
            onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
            onClickRenameMenuItem={renameMenuItemClickHandler}
            onClickDeleteMenuItem={deleteMenuItemClickHandler}
            onClickRevertMenuItem={putBackClickHandler}
            additionalMenuItemOnTopRenderer={canMoveToRoot
              ? () => <BookmarkMoveToRootBtn pageId={bookmarkedPage._id} onClickMoveToRootHandler={onClickMoveToRootHandler} />
              : undefined}
          >
            <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
              <i className="icon-options fa fa-rotate-90 p-1"></i>
            </DropdownToggle>
          </PageItemControl>
        </div>

        <UncontrolledTooltip
          modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
          autohide={false}
          placement="right"
          target={bookmarkItemId}
          fade={false}
        >
          {formerPagePath !== null ? `${formerPagePath}/` : '/'}
        </UncontrolledTooltip>
      </li>
    </DragAndDropWrapper>
  );
};
