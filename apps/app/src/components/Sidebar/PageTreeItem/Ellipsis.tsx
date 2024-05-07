import type { FC } from 'react';
import React, {
  useCallback, useRef, useState,
} from 'react';

import nodePath from 'path';


import type { IPageInfoAll, IPageToDeleteWithMeta } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import { useRect } from '@growi/ui/dist/utils';
import { useTranslation } from 'next-i18next';
import { DropdownToggle } from 'reactstrap';

import { bookmark, unbookmark, resumeRenameOperation } from '~/client/services/page-operation';
import { apiv3Put } from '~/client/util/apiv3-client';
import { ValidationTarget } from '~/client/util/input-validator';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { AutosizeSubmittableInput } from '~/components/Common/SubmittableInput';
import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import { useSWRMUTxCurrentUserBookmarks } from '~/stores/bookmark';
import { useSWRMUTxPageInfo } from '~/stores/page';

import { PageItemControl } from '../../Common/Dropdown/PageItemControl';
import {
  type TreeItemToolProps, NotDraggableForClosableTextInput,
} from '../../TreeItem';


import styles from './Ellipsis.module.scss';

const renameInputContainerClass = styles['rename-input-container'] ?? '';


export const Ellipsis: FC<TreeItemToolProps> = (props) => {
  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const { t } = useTranslation();

  const {
    itemNode, onRenamed, onClickDuplicateMenuItem,
    onClickDeleteMenuItem, isEnableActions, isReadOnlyUser,
  } = props;

  const parentRef = useRef<HTMLDivElement>(null);
  const parentRect = useRect(parentRef);

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

  const renameMenuItemClickHandler = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const cancel = useCallback(() => {
    setRenameInputShown(false);
  }, []);

  const rename = useCallback(async(inputText) => {
    if (inputText.trim() === '') {
      return cancel();
    }

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

      onRenamed?.(page.path, newPagePath);

      toastSuccess(t('renamed_pages', { path: page.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  }, [cancel, onRenamed, page._id, page.path, page.revision, t]);

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

  const maxWidth = parentRect[0]?.width;
  console.log({ parentRef });
  console.log('maxWidth:', maxWidth);

  return (
    <>
      {/* {isRenameInputShown || page._id === '6630d957b26dc26e85ee21a8' ? ( */}
      {/* <NotDraggableForClosableTextInput> */}
      <div ref={parentRef} className={`position-absolute ${renameInputContainerClass} ${isRenameInputShown || page._id === '6630d957b26dc26e85ee21a8' ? '' : 'd-none'}`}>
        <AutosizeSubmittableInput
          value={nodePath.basename(page.path ?? '')}
          inputClassName="form-control"
          inputStyle={{ maxWidth }}
          placeholder={t('Input page name')}
          onSubmit={rename}
          onCancel={cancel}
          // validationTarget={ValidationTarget.PAGE}
          autoFocus
        />
      </div>
      {/* </NotDraggableForClosableTextInput> */}

      { !isRenameInputShown && (
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
              <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control p-0 mr-1">
                <span id="option-button-in-page-tree" className="material-symbols-outlined p-1">more_vert</span>
              </DropdownToggle>
            </PageItemControl>
          </div>
        </NotAvailableForGuest>
      ) }
    </>
  );
};
