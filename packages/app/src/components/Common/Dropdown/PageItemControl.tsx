import React, { useState, useCallback } from 'react';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import { useTranslation } from 'react-i18next';

import loggerFactory from '~/utils/logger';

import {
  IPageInfoAll, isIPageInfoForOperation,
} from '~/interfaces/page';
import { useSWRxPageInfo } from '~/stores/page';

const logger = loggerFactory('growi:cli:PageItemControl');


export const MenuItemType = {
  BOOKMARK: 'bookmark',
  DUPLICATE: 'duplicate',
  RENAME: 'rename',
  DELETE: 'delete',
  REVERT: 'revert',
} as const;
export type MenuItemType = typeof MenuItemType[keyof typeof MenuItemType];

export type ForceHideMenuItems = MenuItemType[];

export type AdditionalMenuItemsRendererProps = { pageInfo: IPageInfoAll };

type CommonProps = {
  pageInfo?: IPageInfoAll,
  isEnableActions?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,
  dataTestId?: string

  onClickBookmarkMenuItem?: (pageId: string, newValue?: boolean) => Promise<void>,
  onClickDuplicateMenuItem?: (pageId: string) => Promise<void> | void,
  onClickRenameMenuItem?: (pageId: string) => Promise<void> | void,
  onClickDeleteMenuItem?: (pageId: string, pageInfo: IPageInfoAll | undefined) => Promise<void> | void,
  onClickRevertMenuItem?: (pageId: string) => Promise<void> | void,

  additionalMenuItemRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
}


type DropdownMenuProps = CommonProps & {
  pageId: string,
  isLoading?: boolean,
}

const PageItemControlDropdownMenu = React.memo((props: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation('');

  const {
    dataTestId,
    pageId, isLoading,
    pageInfo, isEnableActions, forceHideMenuItems,
    onClickBookmarkMenuItem, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem, onClickRevertMenuItem,
    additionalMenuItemRenderer: AdditionalMenuItems,
  } = props;


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bookmarkItemClickedHandler = useCallback(async() => {
    if (!isIPageInfoForOperation(pageInfo) || onClickBookmarkMenuItem == null) {
      return;
    }
    await onClickBookmarkMenuItem(pageId, !pageInfo.isBookmarked);
  }, [onClickBookmarkMenuItem, pageId, pageInfo]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const duplicateItemClickedHandler = useCallback(async() => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }
    await onClickDuplicateMenuItem(pageId);
  }, [onClickDuplicateMenuItem, pageId]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renameItemClickedHandler = useCallback(async() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    await onClickRenameMenuItem(pageId);
  }, [onClickRenameMenuItem, pageId]);

  const revertItemClickedHandler = useCallback(async() => {
    if (onClickRevertMenuItem == null) {
      return;
    }
    await onClickRevertMenuItem(pageId);
  }, [onClickRevertMenuItem]);


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

    contents = (
      <>
        { !isEnableActions && (
          <DropdownItem>
            <p>
              {t('search_result.currently_not_implemented')}
            </p>
          </DropdownItem>
        ) }

        {/* Bookmark */}
        { !forceHideMenuItems?.includes(MenuItemType.BOOKMARK) && isEnableActions && !pageInfo.isEmpty && isIPageInfoForOperation(pageInfo) && (
          <DropdownItem onClick={bookmarkItemClickedHandler}>
            <i className="fa fa-fw fa-bookmark-o"></i>
            { pageInfo.isBookmarked ? t('remove_bookmark') : t('add_bookmark') }
          </DropdownItem>
        ) }

        {/* Duplicate */}
        { !forceHideMenuItems?.includes(MenuItemType.DUPLICATE) && isEnableActions && (
          <DropdownItem onClick={duplicateItemClickedHandler}>
            <i className="icon-fw icon-docs"></i>
            {t('Duplicate')}
          </DropdownItem>
        ) }

        {/* Move/Rename */}
        { !forceHideMenuItems?.includes(MenuItemType.RENAME) && isEnableActions && pageInfo.isMovable && (
          <DropdownItem onClick={renameItemClickedHandler}>
            <i className="icon-fw  icon-action-redo"></i>
            {t('Move/Rename')}
          </DropdownItem>
        ) }

        {/* Revert */}
        { !forceHideMenuItems?.includes(MenuItemType.REVERT) && isEnableActions && pageInfo.isRevertible && (
          <DropdownItem onClick={revertItemClickedHandler}>
            <i className="icon-fw  icon-action-undo"></i>
            {t('modal_putback.label.Put Back Page')}
          </DropdownItem>
        ) }

        { AdditionalMenuItems && (
          <>
            { showDeviderBeforeAdditionalMenuItems && <DropdownItem divider /> }
            <AdditionalMenuItems pageInfo={pageInfo} />
          </>
        ) }

        {/* divider */}
        {/* Delete */}
        { !forceHideMenuItems?.includes(MenuItemType.DELETE) && isEnableActions && pageInfo.isMovable && (
          <>
            { showDeviderBeforeDelete && <DropdownItem divider /> }
            <DropdownItem
              className={`pt-2 ${pageInfo.isDeletable ? 'text-danger' : ''}`}
              disabled={!pageInfo.isDeletable}
              onClick={deleteItemClickedHandler}
            >
              <i className="icon-fw icon-trash"></i>
              {t('Delete')}
            </DropdownItem>
          </>
        )}
      </>
    );
  }

  return (
    <DropdownMenu
      data-testid={dataTestId || ''}
      positionFixed
      modifiers={{ preventOverflow: { boundariesElement: undefined } }}
    >
      {contents}
    </DropdownMenu>
  );
});


type PageItemControlSubstanceProps = CommonProps & {
  pageId: string,
  fetchOnInit?: boolean,
  children?: React.ReactNode,
}

export const PageItemControlSubstance = (props: PageItemControlSubstanceProps): JSX.Element => {

  const {
    pageId, pageInfo: presetPageInfo, fetchOnInit,
    children,
    onClickBookmarkMenuItem, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const shouldFetch = fetchOnInit === true || (!isIPageInfoForOperation(presetPageInfo) && isOpen);
  const shouldMutate = fetchOnInit === true || !isIPageInfoForOperation(presetPageInfo);

  const { data: fetchedPageInfo, mutate: mutatePageInfo } = useSWRxPageInfo(shouldFetch ? pageId : null);

  // mutate after handle event
  const bookmarkMenuItemClickHandler = useCallback(async(_pageId: string, _newValue: boolean) => {
    if (onClickBookmarkMenuItem != null) {
      await onClickBookmarkMenuItem(_pageId, _newValue);
    }

    if (shouldMutate) {
      mutatePageInfo();
    }
  }, [mutatePageInfo, onClickBookmarkMenuItem, shouldMutate]);

  const isLoading = shouldFetch && fetchedPageInfo == null;

  const duplicateMenuItemClickHandler = useCallback(async() => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }
    await onClickDuplicateMenuItem(pageId);
  }, [onClickDuplicateMenuItem, pageId]);

  const renameMenuItemClickHandler = useCallback(async() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    await onClickRenameMenuItem(pageId);
  }, [onClickRenameMenuItem, pageId]);

  const deleteMenuItemClickHandler = useCallback(async() => {
    if (onClickDeleteMenuItem == null) {
      return;
    }
    await onClickDeleteMenuItem(pageId, fetchedPageInfo ?? presetPageInfo);
  }, [onClickDeleteMenuItem, pageId, fetchedPageInfo, presetPageInfo]);

  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>

      { children ?? (
        <DropdownToggle color="transparent" className="border-0 rounded btn-page-item-control">
          <i className="icon-options text-muted"></i>
        </DropdownToggle>
      ) }

      <PageItemControlDropdownMenu
        {...props}
        isLoading={isLoading}
        pageInfo={fetchedPageInfo ?? presetPageInfo}
        onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
        onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
        onClickRenameMenuItem={renameMenuItemClickHandler}
        onClickDeleteMenuItem={deleteMenuItemClickHandler}
      />
    </Dropdown>
  );

};


type PageItemControlProps = CommonProps & {
  pageId?: string,
  children?: React.ReactNode,
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
