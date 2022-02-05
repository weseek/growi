import React, { useState, useCallback } from 'react';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import toastr from 'toastr';
import { useTranslation } from 'react-i18next';

import loggerFactory from '~/utils/logger';

import {
  IPageInfo, IPageInfoCommon, isExistPageInfo,
} from '~/interfaces/page';
import { useSWRxPageInfo } from '~/stores/page';

const logger = loggerFactory('growi:cli:PageItemControl');


export type AdditionalMenuItemsRendererProps = { pageInfo: IPageInfoCommon | IPageInfo };

type CommonProps = {
  pageInfo?: IPageInfoCommon | IPageInfo,
  isEnableActions?: boolean,
  hideBookmarkMenuItem?: boolean,
  onClickBookmarkMenuItem?: (pageId: string, newValue?: boolean) => Promise<void> | void,
  onClickDuplicateMenuItem?: () => Promise<void> | void,
  onClickRenameMenuItem?: (pageId: string) => Promise<void> | void,
  onClickDeleteMenuItem?: (pageId: string) => Promise<void> | void,

  additionalMenuItemRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
}


type DropdownMenuProps = CommonProps & {
  pageId: string,
}

const PageItemControlDropdownMenu = React.memo((props: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation('');

  const {
    pageId, pageInfo, isEnableActions, hideBookmarkMenuItem,
    onClickBookmarkMenuItem, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
    additionalMenuItemRenderer: AdditionalMenuItems,
  } = props;


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bookmarkItemClickedHandler = useCallback(async() => {
    if (!isExistPageInfo(pageInfo) || onClickBookmarkMenuItem == null) {
      return;
    }
    await onClickBookmarkMenuItem(pageId, !pageInfo.isBookmarked);
  }, [onClickBookmarkMenuItem, pageId, pageInfo]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const duplicateItemClickedHandler = useCallback(async() => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }
    await onClickDuplicateMenuItem();
  }, [onClickDuplicateMenuItem]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renameItemClickedHandler = useCallback(async() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    await onClickRenameMenuItem(pageId);
  }, [onClickRenameMenuItem, pageId]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deleteItemClickedHandler = useCallback(async() => {
    if (!isExistPageInfo(pageInfo) || onClickDeleteMenuItem == null) {
      return;
    }
    if (!pageInfo.isDeletable) {
      logger.warn('This page could not be deleted.');
      return;
    }
    await onClickDeleteMenuItem(pageId);
  }, [onClickDeleteMenuItem, pageId, pageInfo]);

  if (pageId == null || pageInfo == null) {
    return <></>;
  }

  return (
    <DropdownMenu positionFixed modifiers={{ preventOverflow: { boundariesElement: undefined } }}>

      { !isEnableActions && (
        <DropdownItem>
          <p>
            {t('search_result.currently_not_implemented')}
          </p>
        </DropdownItem>
      ) }

      {/* Bookmark */}
      { !hideBookmarkMenuItem && isExistPageInfo(pageInfo) && isEnableActions && (
        <DropdownItem onClick={bookmarkItemClickedHandler}>
          <i className="fa fa-fw fa-bookmark-o"></i>
          { pageInfo.isBookmarked ? t('remove_bookmark') : t('add_bookmark') }
        </DropdownItem>
      ) }

      {/* Duplicate */}
      { isExistPageInfo(pageInfo) && isEnableActions && (
        <DropdownItem onClick={duplicateItemClickedHandler}>
          <i className="icon-fw icon-docs"></i>
          {t('Duplicate')}
        </DropdownItem>
      ) }

      {/* Move/Rename */}
      { isEnableActions && pageInfo.isMovable && (
        <DropdownItem onClick={renameItemClickedHandler}>
          <i className="icon-fw  icon-action-redo"></i>
          {t('Move/Rename')}
        </DropdownItem>
      ) }

      { AdditionalMenuItems && <AdditionalMenuItems pageInfo={pageInfo} /> }

      {/* divider */}
      {/* Delete */}
      { isExistPageInfo(pageInfo) && isEnableActions && pageInfo.isMovable && (
        <>
          <DropdownItem divider />
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
    </DropdownMenu>
  );
});


type PageItemControlSubstanceProps = CommonProps & {
  pageId: string,
  fetchOnOpen?: boolean,
}

export const PageItemControlSubstance = (props: PageItemControlSubstanceProps): JSX.Element => {

  const {
    pageId, pageInfo: presetPageInfo, fetchOnOpen,
    onClickBookmarkMenuItem, onClickDuplicateMenuItem,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const shouldFetch = presetPageInfo == null && (!fetchOnOpen || isOpen);
  const { data: fetchedPageInfo, mutate: mutatePageInfo } = useSWRxPageInfo(shouldFetch ? pageId : null);

  // mutate after handle event
  const bookmarkMenuItemClickHandler = useCallback(async(_pageId: string, _newValue: boolean) => {
    if (onClickBookmarkMenuItem != null) {
      await onClickBookmarkMenuItem(_pageId, _newValue);
    }

    if (shouldFetch) {
      mutatePageInfo();
    }
  }, [mutatePageInfo, onClickBookmarkMenuItem, shouldFetch]);

  const duplicateMenuItemClickHandler = useCallback(async() => {
    if (onClickDuplicateMenuItem == null) {
      return;
    }
    await onClickDuplicateMenuItem();
  }, [onClickDuplicateMenuItem]);

  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      <DropdownToggle color="transparent" className="border-0 rounded grw-btn-page-management p-0">
        <i className="icon-options fa fa-rotate-90 text-muted p-1"></i>
      </DropdownToggle>

      <PageItemControlDropdownMenu
        {...props}
        pageInfo={presetPageInfo ?? fetchedPageInfo}
        onClickBookmarkMenuItem={bookmarkMenuItemClickHandler}
        onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
      />
    </Dropdown>
  );

};


type PageItemControlProps = CommonProps & {
  pageId?: string,
  path?: string,
}

export const PageItemControl = (props: PageItemControlProps): JSX.Element => {
  const { pageId, path } = props;

  if (pageId == null || path == null) {
    return <></>;
  }

  return <PageItemControlSubstance pageId={pageId} {...props} />;
};


type AsyncPageItemControlProps = CommonProps & {
  pageId?: string,
}

export const AsyncPageItemControl = (props: AsyncPageItemControlProps): JSX.Element => {
  const { pageId } = props;

  if (pageId == null) {
    return <></>;
  }

  return <PageItemControlSubstance pageId={pageId} fetchOnOpen {...props} />;
};
