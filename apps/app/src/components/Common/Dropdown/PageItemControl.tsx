import React, { useState, useCallback, useEffect } from 'react';

import { getCustomModifiers } from '@growi/ui/dist/utils';
import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import { NotAvailableForGuest } from '~/components/NotAvailableForGuest';
import {
  IPageInfoAll, isIPageInfoForOperation,
} from '~/interfaces/page';
import { IPageOperationProcessData } from '~/interfaces/page-operation';
import { useSWRxPageInfo } from '~/stores/page';
import loggerFactory from '~/utils/logger';
import { shouldRecoverPagePaths } from '~/utils/page-operation';

const logger = loggerFactory('growi:cli:PageItemControl');


export const MenuItemType = {
  BOOKMARK: 'bookmark',
  RENAME: 'rename',
  DUPLICATE: 'duplicate',
  DELETE: 'delete',
  REVERT: 'revert',
  PATH_RECOVERY: 'pathRecovery',
  SWITCH_CONTENT_WIDTH: 'switch_content_width',
} as const;
export type MenuItemType = typeof MenuItemType[keyof typeof MenuItemType];

export type ForceHideMenuItems = MenuItemType[];

export type AdditionalMenuItemsRendererProps = { pageInfo: IPageInfoAll };

type CommonProps = {
  pageInfo?: IPageInfoAll,
  isEnableActions?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,

  onClickBookmarkMenuItem?: (pageId: string, newValue?: boolean) => Promise<void>,
  onClickRenameMenuItem?: (pageId: string, pageInfo: IPageInfoAll | undefined) => Promise<void> | void,
  onClickDuplicateMenuItem?: (pageId: string) => Promise<void> | void,
  onClickDeleteMenuItem?: (pageId: string, pageInfo: IPageInfoAll | undefined) => Promise<void> | void,
  onClickRevertMenuItem?: (pageId: string) => Promise<void> | void,
  onClickPathRecoveryMenuItem?: (pageId: string) => Promise<void> | void,

  additionalMenuItemOnTopRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
  additionalMenuItemRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
  isInstantRename?: boolean,
  alignRight?: boolean,
}


type DropdownMenuProps = CommonProps & {
  pageId: string,
  isLoading?: boolean,
  operationProcessData?: IPageOperationProcessData,
}

const PageItemControlDropdownMenu = React.memo((props: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation('');

  const {
    pageId, isLoading, pageInfo, isEnableActions, forceHideMenuItems, operationProcessData,
    onClickBookmarkMenuItem, onClickRenameMenuItem, onClickDuplicateMenuItem, onClickDeleteMenuItem,
    onClickRevertMenuItem, onClickPathRecoveryMenuItem,
    additionalMenuItemOnTopRenderer: AdditionalMenuItemsOnTop,
    additionalMenuItemRenderer: AdditionalMenuItems,
    isInstantRename, alignRight,
  } = props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bookmarkItemClickedHandler = useCallback(async() => {
    if (!isIPageInfoForOperation(pageInfo) || onClickBookmarkMenuItem == null) {
      return;
    }
    await onClickBookmarkMenuItem(pageId, !pageInfo.isBookmarked);
  }, [onClickBookmarkMenuItem, pageId, pageInfo]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renameItemClickedHandler = useCallback(async() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    if (!pageInfo?.isMovable) {
      logger.warn('This page could not be renamed.');
      return;
    }
    await onClickRenameMenuItem(pageId, pageInfo);
  }, [onClickRenameMenuItem, pageId, pageInfo]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const duplicateItemClickedHandler = useCallback(async() => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }
    await onClickDuplicateMenuItem(pageId);
  }, [onClickDuplicateMenuItem, pageId]);

  const revertItemClickedHandler = useCallback(async() => {
    if (onClickRevertMenuItem == null) {
      return;
    }
    await onClickRevertMenuItem(pageId);
  }, [onClickRevertMenuItem, pageId]);


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deleteItemClickedHandler = useCallback(async() => {
    if (pageInfo == null || onClickDeleteMenuItem == null) {
      return;
    }
    if (!pageInfo.isDeletable) {
      logger.warn('This page could not be deleted.');
      return;
    }
    await onClickDeleteMenuItem(pageId, pageInfo);
  }, [onClickDeleteMenuItem, pageId, pageInfo]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pathRecoveryItemClickedHandler = useCallback(async() => {
    if (onClickPathRecoveryMenuItem == null) {
      return;
    }
    await onClickPathRecoveryMenuItem(pageId);
  }, [onClickPathRecoveryMenuItem, pageId]);

  let contents = <></>;

  if (isLoading) {
    contents = (
      <div className="text-muted text-center my-2">
        <i className="fa fa-spinner fa-pulse"></i>
      </div>
    );
  }
  else if (pageId != null && pageInfo != null) {

    const showDeviderBeforeAdditionalMenuItems = (forceHideMenuItems?.length ?? 0) < 3;
    const showDeviderBeforeDelete = AdditionalMenuItems != null || showDeviderBeforeAdditionalMenuItems;

    // PathRecovery
    // Todo: It is wanted to find a better way to pass operationProcessData to PageItemControl
    const shouldShowPathRecoveryButton = operationProcessData != null ? shouldRecoverPagePaths(operationProcessData) : false;

    contents = (
      <>
        { !isEnableActions && (
          <DropdownItem>
            <p>
              {t('search_result.currently_not_implemented')}
            </p>
          </DropdownItem>
        ) }

        { AdditionalMenuItemsOnTop && (
          <>
            <AdditionalMenuItemsOnTop pageInfo={pageInfo} />
            <DropdownItem divider />
          </>
        ) }

        {/* Bookmark */}
        { !forceHideMenuItems?.includes(MenuItemType.BOOKMARK) && isEnableActions && isIPageInfoForOperation(pageInfo) && (
          <DropdownItem
            onClick={bookmarkItemClickedHandler}
            className="grw-page-control-dropdown-item"
            data-testid="add-remove-bookmark-btn"
          >
            <i className="fa fa-fw fa-bookmark-o grw-page-control-dropdown-icon"></i>
            { pageInfo.isBookmarked ? t('remove_bookmark') : t('add_bookmark') }
          </DropdownItem>
        ) }

        {/* Move/Rename */}
        { !forceHideMenuItems?.includes(MenuItemType.RENAME) && isEnableActions && pageInfo.isMovable && (
          <DropdownItem
            onClick={renameItemClickedHandler}
            data-testid="open-page-move-rename-modal-btn"
            className="grw-page-control-dropdown-item"
          >
            <i className="icon-fw icon-action-redo grw-page-control-dropdown-icon"></i>
            {t(isInstantRename ? 'Rename' : 'Move/Rename')}
          </DropdownItem>
        ) }

        {/* Duplicate */}
        { !forceHideMenuItems?.includes(MenuItemType.DUPLICATE) && isEnableActions && (
          <DropdownItem
            onClick={duplicateItemClickedHandler}
            data-testid="open-page-duplicate-modal-btn"
            className="grw-page-control-dropdown-item"
          >
            <i className="icon-fw icon-docs grw-page-control-dropdown-icon"></i>
            {t('Duplicate')}
          </DropdownItem>
        ) }

        {/* Revert */}
        { !forceHideMenuItems?.includes(MenuItemType.REVERT) && isEnableActions && pageInfo.isRevertible && (
          <DropdownItem
            onClick={revertItemClickedHandler}
            className="grw-page-control-dropdown-item"
          >
            <i className="icon-fw icon-action-undo grw-page-control-dropdown-icon"></i>
            {t('modal_putback.label.Put Back Page')}
          </DropdownItem>
        ) }

        { AdditionalMenuItems && (
          <>
            { showDeviderBeforeAdditionalMenuItems && <DropdownItem divider /> }
            <AdditionalMenuItems pageInfo={pageInfo} />
          </>
        ) }

        {/* PathRecovery */}
        { !forceHideMenuItems?.includes(MenuItemType.PATH_RECOVERY) && isEnableActions && shouldShowPathRecoveryButton && (
          <DropdownItem
            onClick={pathRecoveryItemClickedHandler}
            className="grw-page-control-dropdown-item"
          >
            <i className="icon-fw icon-wrench grw-page-control-dropdown-icon"></i>
            {t('PathRecovery')}
          </DropdownItem>
        ) }

        {/* divider */}
        {/* Delete */}
        { !forceHideMenuItems?.includes(MenuItemType.DELETE) && isEnableActions && pageInfo.isMovable && (
          <>
            { showDeviderBeforeDelete && <DropdownItem divider /> }
            <DropdownItem
              className={`pt-2 grw-page-control-dropdown-item ${pageInfo.isDeletable ? 'text-danger' : ''}`}
              disabled={!pageInfo.isDeletable}
              onClick={deleteItemClickedHandler}
              data-testid="open-page-delete-modal-btn"
            >
              <i className="icon-fw icon-trash grw-page-control-dropdown-icon"></i>
              {t('Delete')}
            </DropdownItem>
          </>
        )}
      </>
    );
  }

  return (
    <DropdownMenu
      data-testid="page-item-control-menu"
      right={alignRight}
      modifiers={getCustomModifiers(alignRight)}
      container="body"
      persist={!!alignRight}
      style={{ zIndex: 1055 }} /* make it larger than $zindex-modal of bootstrap */
    >
      {contents}
    </DropdownMenu>
  );
});

PageItemControlDropdownMenu.displayName = 'PageItemControl';


type PageItemControlSubstanceProps = CommonProps & {
  pageId: string,
  fetchOnInit?: boolean,
  children?: React.ReactNode,
  operationProcessData?: IPageOperationProcessData,
}

export const PageItemControlSubstance = (props: PageItemControlSubstanceProps): JSX.Element => {

  const {
    pageId, pageInfo: presetPageInfo, fetchOnInit, children, onClickBookmarkMenuItem, onClickRenameMenuItem,
    onClickDuplicateMenuItem, onClickDeleteMenuItem, onClickPathRecoveryMenuItem,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(fetchOnInit ?? false);

  const { data: fetchedPageInfo, mutate: mutatePageInfo } = useSWRxPageInfo(shouldFetch ? pageId : null);

  // update shouldFetch (and will never be false)
  useEffect(() => {
    if (shouldFetch) {
      return;
    }
    if (!isIPageInfoForOperation(presetPageInfo) && isOpen) {
      setShouldFetch(true);
    }
  }, [isOpen, presetPageInfo, shouldFetch]);

  // mutate after handle event
  const bookmarkMenuItemClickHandler = useCallback(async(_pageId: string, _newValue: boolean) => {
    if (onClickBookmarkMenuItem != null) {
      await onClickBookmarkMenuItem(_pageId, _newValue);
    }

    if (shouldFetch) {
      mutatePageInfo();
    }
  }, [mutatePageInfo, onClickBookmarkMenuItem, shouldFetch]);

  const isLoading = shouldFetch && fetchedPageInfo == null;

  const renameMenuItemClickHandler = useCallback(async() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    await onClickRenameMenuItem(pageId, fetchedPageInfo ?? presetPageInfo);
  }, [onClickRenameMenuItem, pageId, fetchedPageInfo, presetPageInfo]);

  const duplicateMenuItemClickHandler = useCallback(async() => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }
    await onClickDuplicateMenuItem(pageId);
  }, [onClickDuplicateMenuItem, pageId]);

  const deleteMenuItemClickHandler = useCallback(async() => {
    if (onClickDeleteMenuItem == null) {
      return;
    }
    await onClickDeleteMenuItem(pageId, fetchedPageInfo ?? presetPageInfo);
  }, [onClickDeleteMenuItem, pageId, fetchedPageInfo, presetPageInfo]);

  const pathRecoveryMenuItemClickHandler = useCallback(async() => {
    if (onClickPathRecoveryMenuItem == null) {
      return;
    }
    await onClickPathRecoveryMenuItem(pageId);
  }, [onClickPathRecoveryMenuItem, pageId]);

  return (
    <NotAvailableForGuest>
      <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} data-testid="open-page-item-control-btn">
        { children ?? (
          <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control d-flex align-items-center justify-content-center">
            <i className="icon-options"></i>
          </DropdownToggle>
        ) }

        <PageItemControlDropdownMenu
          {...props}
          isLoading={isLoading}
          pageInfo={fetchedPageInfo ?? presetPageInfo}
          onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
          onClickRenameMenuItem={renameMenuItemClickHandler}
          onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
          onClickDeleteMenuItem={deleteMenuItemClickHandler}
          onClickPathRecoveryMenuItem={pathRecoveryMenuItemClickHandler}
        />
      </Dropdown>

    </NotAvailableForGuest>

  );

};


export type PageItemControlProps = CommonProps & {
  pageId?: string,
  children?: React.ReactNode,
  operationProcessData?: IPageOperationProcessData,
}

export const PageItemControl = (props: PageItemControlProps): JSX.Element => {
  const { pageId } = props;

  if (pageId == null) {
    return <></>;
  }

  return <PageItemControlSubstance pageId={pageId} {...props} />;
};


type AsyncPageItemControlProps = Omit<CommonProps, 'pageInfo'> & {
  pageId?: string,
  children?: React.ReactNode,
}

export const AsyncPageItemControl = (props: AsyncPageItemControlProps): JSX.Element => {
  const { pageId } = props;

  if (pageId == null) {
    return <></>;
  }

  return <PageItemControlSubstance pageId={pageId} fetchOnInit {...props} />;
};
