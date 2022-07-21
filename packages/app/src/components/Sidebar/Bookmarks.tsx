
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';

import nodePath from 'path';

import { DevidedPagePath, pathUtils } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip, DropdownToggle } from 'reactstrap';
import type { SWRInfiniteResponse } from 'swr/infinite';

import { unbookmark } from '~/client/services/page-operation';
import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { IPageHasId, IPageInfoAll, IPageToDeleteWithMeta } from '~/interfaces/page';
import { OnDeletedFunction } from '~/interfaces/ui';
import LinkedPagePath from '~/models/linked-page-path';
import { useSWRInifiniteBookmarkedPage } from '~/stores/bookmark';
import { useCurrentUser } from '~/stores/context';
import { usePageDeleteModal } from '~/stores/modal';

import ClosableTextInput, { AlertInfo, AlertType } from '../Common/ClosableTextInput';
import { MenuItemType, PageItemControl } from '../Common/Dropdown/PageItemControl';
import PagePathHierarchicalLink from '../PagePathHierarchicalLink';

import InfiniteScroll from './InfiniteScroll';

type Props = {
  page: IPageHasId,
  swr: SWRInfiniteResponse
}
const BookmarksItem:FC<Props> = (props: Props) : JSX.Element => {
  const { t } = useTranslation();
  const { page, swr } = props;
  const dPagePath = new DevidedPagePath(page.path, false, true);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const bookmarkItemId = `bookmark-item-${page._id}`;
  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const { open: openDeleteModal } = usePageDeleteModal();

  const bookmarkMenuItemClickHandler = useCallback(async() => {
    await unbookmark(page._id);
    swr.mutate();
  }, [swr, page]);

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

  const onPressEnterForRenameHandler = useCallback(async(inputText: string) => {
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
      swr.mutate();
      toastSuccess(t('renamed_pages', { path: page.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  }, [swr, page, t]);


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
        swr.mutate();
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
  }, [page, swr, openDeleteModal, t]);

  return (
    <>
      <li className="list-group-item py-3 px-2" id={bookmarkItemId}>
        <div className="d-flex w-100 justify-content-between">
          { isRenameInputShown ? (
            <ClosableTextInput
              value={nodePath.basename(page.path ?? '')}
              placeholder={t('Input page name')}
              onClickOutside={() => { setRenameInputShown(false) }}
              onPressEnter={onPressEnterForRenameHandler}
              inputValidator={inputValidator}
            />
          ) : (
            <h5 className="my-0">
              <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
            </h5>
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
            placement="left"
            target={bookmarkItemId}
          >
            {page.path}
          </UncontrolledTooltip>
        </div>
      </li>

    </>
  );

};

const Bookmarks = () : JSX.Element => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const swr = useSWRInifiniteBookmarkedPage(currentUser?._id);
  const isEmpty = swr.data?.[0].docs.length === 0;
  const isReachingEnd = isEmpty || (swr.data && swr.data[0].nextPage == null);

  useEffect(() => {
    swr.mutate();
  }, []);

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Bookmarks')}</h3>
      </div>
      <div className="grw-bookmarks-list p-3">
        {isEmpty ? t('No bookmarks yet') : (
          <div>
            <ul className="list-group list-group-flush">
              <InfiniteScroll
                swrInifiniteResponse={swr}
                isReachingEnd={isReachingEnd}
              >
                {paginationResult => paginationResult?.docs.map(data => (
                  <BookmarksItem key={data.page._id} page={data.page} swr={swr} />
                ))
                }
              </InfiniteScroll>
            </ul>
          </div>
        )}
      </div>
    </>
  );

};

export default Bookmarks;
