import React, {
  useCallback, useEffect, useState, useMemo,
} from 'react';

import nodePath from 'path';

import { DevidedPagePath, pathUtils } from '@growi/core';
import { useTranslation } from 'react-i18next';
import {
  UncontrolledTooltip, DropdownItem, DropdownToggle,
} from 'reactstrap';

import { unbookmark } from '~/client/services/page-operation';
import { addBookmarkToFolder, renamePage } from '~/client/util/bookmark-utils';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastError } from '~/client/util/toastr';
import { BookmarkFolderItems, DragItemDataType, DRAG_ITEM_TYPE } from '~/interfaces/bookmark-info';
import { IPageHasId, IPageInfoAll, IPageToDeleteWithMeta } from '~/interfaces/page';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRxBookmarkFolderAndChild } from '~/stores/bookmark-folder';
import { useSWRxPageInfo } from '~/stores/page';

import ClosableTextInput from '../Common/ClosableTextInput';
import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';
import { PageListItemS } from '../PageList/PageListItemS';

import { DragAndDropWrapper } from './DragAndDropWrapper';

type Props = {
  bookmarkedPage: IPageHasId,
  onUnbookmarked: () => void,
  onRenamed: () => void,
  onClickDeleteMenuItem: (pageToDelete: IPageToDeleteWithMeta) => void,
  parentFolder: BookmarkFolderItems | null
  level: number
}

export const BookmarkItem = (props: Props): JSX.Element => {
  const BASE_FOLDER_PADDING = 15;
  const BASE_BOOKMARK_PADDING = 20;
  const { t } = useTranslation();
  const {
    bookmarkedPage, onUnbookmarked, onRenamed, onClickDeleteMenuItem, parentFolder, level,
  } = props;
  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const dPagePath = new DevidedPagePath(bookmarkedPage.path, false, true);
  const { latter: pageTitle, former: formerPagePath } = dPagePath;
  const bookmarkItemId = `bookmark-item-${bookmarkedPage._id}`;
  const { mutate: mutateBookmarkData } = useSWRxBookmarkFolderAndChild();
  const { data: fetchedPageInfo } = useSWRxPageInfo(bookmarkedPage._id);

  const paddingLeft = BASE_BOOKMARK_PADDING + (BASE_FOLDER_PADDING * (level + 1));

  const dragItem: Partial<DragItemDataType> = {
    ...bookmarkedPage, parentFolder,
  };

  useEffect(() => {
    mutateBookmarkData();
  }, [mutateBookmarkData]);

  const pageId = bookmarkedPage._id;

  const { data: userBookmarks, mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();
  const isMoveToRoot = useMemo(() => {
    return !userBookmarks?.map(userBookmark => userBookmark._id).includes(pageId);
  }, [pageId, userBookmarks]);

  const moveToRootClickedHandler = useCallback(async() => {
    try {
      await addBookmarkToFolder(pageId, null);
      await mutateUserBookmarks();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateUserBookmarks, pageId]);

  const additionalMenuItemOnTopRenderer = useMemo(() => {
    return (
      <DropdownItem
        onClick={moveToRootClickedHandler}
        className="grw-page-control-dropdown-item"
        data-testid="add-remove-bookmark-btn"
      >
        <i className="fa fa-fw fa-bookmark-o grw-page-control-dropdown-icon"></i>
        {t('bookmark_folder.move_to_root')}
      </DropdownItem>
    );
  }, [moveToRootClickedHandler, t]);

  const bookmarkMenuItemClickHandler = useCallback(async() => {
    await unbookmark(bookmarkedPage._id);
    onUnbookmarked();
  }, [onUnbookmarked, bookmarkedPage]);

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
      onRenamed();
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  }, [bookmarkedPage, onRenamed]);

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

    onClickDeleteMenuItem(pageToDelete);
  }, [bookmarkedPage, onClickDeleteMenuItem]);

  return (
    <DragAndDropWrapper
      item={dragItem}
      type={[DRAG_ITEM_TYPE.BOOKMARK]}
      useDragMode={true}
    >
      <li
        className="grw-bookmark-item-list list-group-item list-group-item-action border-0 py-0 mr-auto d-flex align-items-center"
        key={bookmarkedPage._id}
        id={bookmarkItemId}
        style={{ paddingLeft }}
      >
        { isRenameInputShown ? (
          <ClosableTextInput
            value={nodePath.basename(bookmarkedPage.path ?? '')}
            placeholder={t('Input page name')}
            onClickOutside={() => { setRenameInputShown(false) }}
            onPressEnter={pressEnterForRenameHandler}
            validationTarget={ValidationTarget.PAGE}
          />
        ) : <PageListItemS page={bookmarkedPage} pageTitle={pageTitle}/>}
        <div className='grw-foldertree-control'>
          <PageItemControl
            pageId={bookmarkedPage._id}
            isEnableActions
            pageInfo={fetchedPageInfo}
            forceHideMenuItems={[MenuItemType.DUPLICATE]}
            onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
            onClickRenameMenuItem={renameMenuItemClickHandler}
            onClickDeleteMenuItem={deleteMenuItemClickHandler}
            additionalMenuItemOnTopRenderer={isMoveToRoot ? (() => additionalMenuItemOnTopRenderer) : undefined}
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
