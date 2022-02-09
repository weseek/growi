import React, { useState, useCallback } from 'react';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import toastr from 'toastr';
import { useTranslation } from 'react-i18next';

import loggerFactory from '~/utils/logger';

import {
  IPageInfoAll, isIPageInfoForOperation,
} from '~/interfaces/page';
import { useSWRxPageInfo } from '~/stores/page';

const logger = loggerFactory('growi:cli:PageItemControl');


export type AdditionalMenuItemsRendererProps = { pageInfo: IPageInfoAll };

type CommonProps = {
  pageInfo?: IPageInfoAll,
  isEnableActions?: boolean,
  showBookmarkMenuItem?: boolean,
  onClickBookmarkMenuItem?: (pageId: string, newValue?: boolean) => Promise<void>,
  onClickDuplicateMenuItem?: () => Promise<void> | void,
  onClickRenameMenuItem?: (pageId: string) => Promise<void> | void,
  onClickDeleteMenuItem?: (pageId: string) => Promise<void> | void,

  additionalMenuItemRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
}


type DropdownMenuProps = CommonProps & {
  pageId: string,
  isLoading?: boolean,
}

const PageItemControlDropdownMenu = React.memo((props: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation('');

  const {
    pageId, isLoading,
    pageInfo, isEnableActions, showBookmarkMenuItem,
    onClickBookmarkMenuItem, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
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
    if (pageInfo == null || onClickDeleteMenuItem == null) {
      return;
    }
    if (!pageInfo.isDeletable) {
      logger.warn('This page could not be deleted.');
      return;
    }
    await onClickDeleteMenuItem(pageId);
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
        { showBookmarkMenuItem && isEnableActions && !pageInfo.isEmpty && isIPageInfoForOperation(pageInfo) && (
          <DropdownItem onClick={bookmarkItemClickedHandler}>
            <i className="fa fa-fw fa-bookmark-o"></i>
            { pageInfo.isBookmarked ? t('remove_bookmark') : t('add_bookmark') }
          </DropdownItem>
        ) }

        {/* Duplicate */}
        { isEnableActions && !pageInfo.isEmpty && (
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
        { isEnableActions && pageInfo.isMovable && !pageInfo.isEmpty && (
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
      </>
    );
  }

  return (
    <DropdownMenu positionFixed modifiers={{ preventOverflow: { boundariesElement: undefined } }}>
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
    onClickBookmarkMenuItem, onClickDuplicateMenuItem, onClickRenameMenuItem,
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
    await onClickDuplicateMenuItem();
  }, [onClickDuplicateMenuItem]);

  const renameMenuItemClickHandler = useCallback(async() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    await onClickRenameMenuItem(pageId);
  }, [onClickRenameMenuItem, pageId]);

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
