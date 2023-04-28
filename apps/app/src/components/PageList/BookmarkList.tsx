import React, { useCallback, useState, useMemo } from 'react';

import nodePath from 'path';

import {
  IPageInfoAll, IPageToDeleteWithMeta, pathUtils,
} from '@growi/core';
import { useTranslation } from 'next-i18next';
import { DropdownToggle } from 'reactstrap';

import { unbookmark } from '~/client/services/page-operation';
import { apiv3Put } from '~/client/util/apiv3-client';
import { addBookmarkToFolder } from '~/client/util/bookmark-utils';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { IPageHasId } from '~/interfaces/page';
import { useSWRxCurrentUserBookmarks } from '~/stores/bookmark';
import loggerFactory from '~/utils/logger';

import { BookmarkMoveToRootBtn } from '../Bookmarks/BookmarkMoveToRootBtn';
import ClosableTextInput from '../Common/ClosableTextInput';
import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';

import { PageListItemS } from './PageListItemS';

const logger = loggerFactory('growi:BookmarkList');

type Props = {
  page: IPageHasId
  onRenamed: () => void
  onUnbookmarked: () => void
  onClickDeleteMenuItem: (pageToDelete: IPageToDeleteWithMeta) => void
}
export const BookmarkList = (props:Props): JSX.Element => {
  const {
    page, onRenamed, onUnbookmarked, onClickDeleteMenuItem,
  } = props;
  const { t } = useTranslation();
  const [isRenameInputShown, setIsRenameInputShown] = useState(false);

  const pageId = page._id;

  const { data: userBookmarks, mutate: mutateUserBookmarks } = useSWRxCurrentUserBookmarks();

  const isMoveToRoot = useMemo(() => {
    return !userBookmarks?.map(userBookmark => userBookmark._id).includes(pageId);
  }, [pageId, userBookmarks]);

  const onClickMoveToRootHandler = useCallback(async() => {
    try {
      await addBookmarkToFolder(pageId, null);
      await mutateUserBookmarks();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateUserBookmarks, pageId]);

  const bookmarkMenuItemClickHandler = useCallback(async() => {
    await unbookmark(page._id);
    onUnbookmarked();
  }, [page._id, onUnbookmarked]);

  const deleteMenuItemClickHandler = useCallback(async(_pageId: string, pageInfo: IPageInfoAll | undefined): Promise<void> => {
    if (page._id == null || page.path == null) {
      throw Error('_id and path must not be null.');
    }

    const pageToDelete: IPageToDeleteWithMeta = {
      data: {
        _id: page._id,
        revision: page.revision as string,
        path: page.path,
      },
      meta: pageInfo,
    };

    onClickDeleteMenuItem(pageToDelete);
  }, [onClickDeleteMenuItem, page]);

  const pressEnterForRenameHandler = useCallback(async(inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(page.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);
    if (newPagePath === page.path) {
      setIsRenameInputShown(false);
      return;
    }

    try {
      setIsRenameInputShown(false);
      await apiv3Put('/pages/rename', {
        pageId: page._id,
        revisionId: page.revision,
        newPagePath,
      });
      onRenamed();
      toastSuccess(t('renamed_pages', { path: page.path }));
    }
    catch (err) {
      setIsRenameInputShown(true);
      logger.error('failed to fetch data', err);
      toastError(err);
    }
  }, [onRenamed, page, t]);

  return (
    <li key={`my-bookmarks:${page?._id}`} className="list-group-item list-group-item-action border-0 py-0 pl-3 d-flex align-items-center">
      { isRenameInputShown ? (
        <ClosableTextInput
          value={nodePath.basename(page.path ?? '')}
          placeholder={t('Input page name')}
          onClickOutside={() => { setIsRenameInputShown(false) }}
          onPressEnter={pressEnterForRenameHandler}
          validationTarget={ValidationTarget.PAGE}
        />
      ) : (
        <PageListItemS page={page} />
      )}

      <PageItemControl
        pageId={page._id}
        isEnableActions
        forceHideMenuItems={[MenuItemType.DUPLICATE]}
        onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
        onClickRenameMenuItem={() => setIsRenameInputShown(true)}
        onClickDeleteMenuItem={deleteMenuItemClickHandler}
        additionalMenuItemOnTopRenderer={isMoveToRoot
          ? () => <BookmarkMoveToRootBtn pageId={pageId} onClickMoveToRootHandler={onClickMoveToRootHandler}/>
          : undefined
        }
      >
        <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
          <i className="icon-options fa fa-rotate-90 p-1"></i>
        </DropdownToggle>
      </PageItemControl>
    </li>

  );
};
