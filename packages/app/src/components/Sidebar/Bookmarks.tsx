
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';

import nodePath from 'path';

import { DevidedPagePath, pathUtils } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';
import { unbookmark } from '~/client/services/page-operation';
import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { IPageHasId, IPageInfoAll, IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import { usePageDeleteModal } from '~/stores/modal';
import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';
import { useCurrentUser, useIsGuestUser } from '~/stores/context';
import loggerFactory from '~/utils/logger';

import ClosableTextInput, { AlertInfo, AlertType } from '../Common/ClosableTextInput';
import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';

const logger = loggerFactory('growi:BookmarkList');
// TODO: Remove pagination and apply  scrolling (not infinity)
const ACTIVE_PAGE = 1;

type Props = {
  page: IPageHasId,
  refreshBookmarkList: () => void
}

const BookmarksItem = (props: Props) => {
  const { t } = useTranslation();
  const { page, refreshBookmarkList } = props;
  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const { latter: pageTitle, former: formerPagePath } = dPagePath;
  const bookmarkItemId = `bookmark-item-${page._id}`;


  const bookmarkMenuItemClickHandler = useCallback(async() => {
    await unbookmark(page._id);
    refreshBookmarkList();
  }, [page, refreshBookmarkList]);

  const renameMenuItemClickHandler = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const inputValidator = (title: string | null): AlertInfo | null => {
    if (title == null || title === '' || title.trim() === '') {
      return {
        type: AlertType.WARNING,
        message: t('form_validation.title_required'),
      };
    }

    return null;
  };

  const pressEnterForRenameHandler = (async(inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(page.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);
    if (newPagePath === page.path) {
      setRenameInputShown(false);
      return;
    }

    try {
      setRenameInputShown(false);
      await apiv3Put('/pages/rename', {
        pageId: page._id,
        revisionId: page.revision,
        newPagePath,
      });
      refreshBookmarkList();
      toastSuccess(t('renamed_pages', { path: page.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  });


  const deleteMenuItemClickHandler = useCallback(async(_pageId: string, pageInfo: IPageInfoAll | undefined): Promise<void> => {
    const onClickDeleteMenuItem = (pageToDelete: IPageToDeleteWithMeta) => {
      const onDeletedHandler: OnDeletedFunction = (pathOrPathsToDelete, _isRecursively, isCompletely) => {
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
        refreshBookmarkList();
      };
      openDeleteModal([pageToDelete], { onDeleted: onDeletedHandler });
    };

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
  }, [page, openDeleteModal, t]);

  return (
    <>
      <div className="d-flex justify-content-between" key={page._id}>
        <li className="list-group-item list-group-item-action border-0 py-0 pr-3 d-flex align-items-center" id={bookmarkItemId}>
          { isRenameInputShown ? (
            <ClosableTextInput
              value={nodePath.basename(page.path ?? '')}
              placeholder={t('Input page name')}
              onClickOutside={() => { setRenameInputShown(false) }}
              onPressEnter={pressEnterForRenameHandler}
              inputValidator={inputValidator}
            />
          ) : (
            <a href={`/${page._id}`} className="grw-bookmarks-title-anchor flex-grow-1">
              <p className={`text-truncate m-auto ${page.isEmpty && 'grw-sidebar-text-muted'}`}>{pageTitle}</p>
            </a>
          )}
          <PageItemControl
            pageId={page._id}
            isEnableActions
            forceHideMenuItems={[MenuItemType.DUPLICATE]}
            onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
            onClickRenameMenuItem={renameMenuItemClickHandler}
            onClickDeleteMenuItem={deleteMenuItemClickHandler}
          >
            <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
              <i className="icon-options fa fa-rotate-90 p-1"></i>
            </DropdownToggle>
          </PageItemControl>
          <UncontrolledTooltip
            modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
            autohide={false}
            placement="right"
            target={bookmarkItemId}
          >
            { formerPagePath || '/' }
          </UncontrolledTooltip>
        </li>
      </div>
    </>
  );
};


const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();
  const [pages, setPages] = useState<IPageHasId[]>([]);
  const page = ACTIVE_PAGE;

  const getMyBookmarkList = useCallback(async() => {
    try {
      const res = await apiv3Get(`/bookmarks/${currentUser?._id}`, { page });
      const { paginationResult } = res.data;
      setPages(paginationResult.docs.map((page) => {
        return {
          ...page.page,
        };
      }));
    }
    catch (error) {
      logger.error('failed to fetch data', error);
      toastError(error, 'Error occurred in bookmark page list');
    }
  }, [currentUser, page]);

  useEffect(() => {
    getMyBookmarkList();
  }, [getMyBookmarkList]);

  const generateBookmarkList = () => {
    return (
      <ul className="grw-bookmarks-list list-group p-3">
        <div className="grw-bookmarks-item-container">
          { pages.map((page) => {
            return (
              <BookmarksItem key={page._id} page={page} refreshBookmarkList={getMyBookmarkList} />
            );
          })}
        </div>
      </ul>
    );
  };

  const renderBookmarksItem = () => {
    if (pages?.length === 0) {
      return (
        <h3 className="pl-3">
          { t('No bookmarks yet') }
        </h3>
      );
    }
    return generateBookmarkList();
  };

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      { isGuestUser
        ? (
          <h3 className="pl-3">
            { t('Not available for guest') }
          </h3>
        ) : renderBookmarksItem()
      }

    </>
  );

};

export default Bookmarks;
