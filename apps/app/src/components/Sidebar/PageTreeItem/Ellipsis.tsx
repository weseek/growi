import type { FC } from 'react';
import React, { useCallback } from 'react';

import type { IPageInfoAll, IPageToDeleteWithMeta } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { DropdownToggle } from 'reactstrap';

import { bookmark, unbookmark, resumeRenameOperation } from '~/client/services/page-operation';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { useSWRMUTxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRMUTxPageInfo } from '~/stores/page';

import { PageItemControl } from '../../Common/Dropdown/PageItemControl';
import { type TreeItemToolProps } from '../../TreeItem';

export const Ellipsis: FC<TreeItemToolProps & { renameMenuItemClickHandler: () => void }> = (props) => {

  const { t } = useTranslation();

  const {
    itemNode, onClickDuplicateMenuItem,
    onClickDeleteMenuItem, isEnableActions, isReadOnlyUser, renameMenuItemClickHandler,
  } = props;

  const { page } = itemNode;

  const { trigger: mutateCurrentUserBookmarks } = useSWRMUTxCurrentUserBookmarks();
  const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(page._id ?? null);

  const bookmarkMenuItemClickHandler = async(_pageId: string, _newValue: boolean): Promise<void> => {
    const bookmarkOperation = _newValue ? bookmark : unbookmark;
    await bookmarkOperation(_pageId);
    mutateCurrentUserBookmarks();
    mutatePageInfo();
  };

  const duplicateMenuItemClickHandler = useCallback((): void => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }

    const { _id: pageId, path } = page;

    if (pageId == null || path == null) {
      throw Error('Any of _id and path must not be null.');
    }

    const pageToDuplicate = { pageId, path };

    onClickDuplicateMenuItem(pageToDuplicate);
  }, [onClickDuplicateMenuItem, page]);

  const deleteMenuItemClickHandler = useCallback(async(_pageId: string, pageInfo: IPageInfoAll | undefined): Promise<void> => {
    if (onClickDeleteMenuItem == null) {
      return;
    }

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

  const pathRecoveryMenuItemClickHandler = async(pageId: string): Promise<void> => {
    try {
      await resumeRenameOperation(pageId);
      toastSuccess(t('page_operation.paths_recovered'));
    }
    catch {
      toastError(t('page_operation.path_recovery_failed'));
    }
  };

  return (
    <NotAvailableForGuest>
      <div className="grw-pagetree-control d-flex">
        <PageItemControl
          pageId={page._id}
          isEnableActions={isEnableActions}
          isReadOnlyUser={isReadOnlyUser}
          onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
          onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
          onClickRenameMenuItem={renameMenuItemClickHandler}
          onClickDeleteMenuItem={deleteMenuItemClickHandler}
          onClickPathRecoveryMenuItem={pathRecoveryMenuItemClickHandler}
          isInstantRename
          // Todo: It is wanted to find a better way to pass operationProcessData to PageItemControl
          operationProcessData={page.processData}
        >
          {/* pass the color property to reactstrap dropdownToggle props. https://6-4-0--reactstrap.netlify.app/components/dropdowns/  */}
          <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 grw-visible-on-hover mr-1">
            <span id="option-button-in-page-tree" className="material-symbols-outlined p-1">more_vert</span>
          </DropdownToggle>
        </PageItemControl>
      </div>
    </NotAvailableForGuest>
  );
};
