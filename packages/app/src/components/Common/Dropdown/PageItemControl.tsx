import React, { FC, useState, useCallback } from 'react';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import toastr from 'toastr';
import { useTranslation } from 'react-i18next';

import loggerFactory from '~/utils/logger';

import {
  IPageHasId, IPageInfo, IPageInfoCommon, isExistPageInfo,
} from '~/interfaces/page';
import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/apiNotification';
import { useSWRBookmarkInfo } from '~/stores/bookmark';
import { useSWRxPageInfo } from '~/stores/page';

const logger = loggerFactory('growi:cli:PageItemControl');

type CommonProps = {
  pageInfo?: IPageInfoCommon | IPageInfo,
  isEnableActions?: boolean
  onClickBookmarkMenuItem?: (pageId: string, bool: boolean) => void
  onClickRenameMenuItem?: (pageId: string) => void
  onClickDeleteMenuItem?: (pageId: string) => void
}


type DropdownMenuProps = CommonProps & {
  pageId: string,
}

const PageItemControlDropdownMenu = React.memo((props: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation('');

  const {
    pageId, pageInfo, isEnableActions,
    onClickBookmarkMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
  } = props;


  const isEmpty = isExistPageInfo(pageInfo);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bookmarkItemClickedHandler = useCallback(() => {
    if (!isEmpty || onClickBookmarkMenuItem == null) {
      return;
    }
    onClickBookmarkMenuItem(pageId, !pageInfo.isBookmarked);
  }, [isEmpty, onClickBookmarkMenuItem, pageId, pageInfo]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renameItemClickedHandler = useCallback(() => {
    if (onClickRenameMenuItem == null) {
      return;
    }
    onClickRenameMenuItem(pageId);
  }, [onClickRenameMenuItem, pageId]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deleteItemClickedHandler = useCallback(() => {
    if (!isEmpty || onClickDeleteMenuItem == null) {
      return;
    }
    if (!pageInfo.isDeletable) {
      logger.warn('This page could not be deleted.');
      return;
    }
    onClickDeleteMenuItem(pageId);
  }, [isEmpty, onClickDeleteMenuItem, pageId, pageInfo]);

  // const bookmarkToggleHandler = (async() => {
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //     await apiv3Put('/bookmarks', { pageId: page._id, bool: !bookmarkInfo!.isBookmarked });
  //     mutateBookmarkInfo();
  //   }
  //   catch (err) {
  //     toastError(err);
  //   }
  // });

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
      { isExistPageInfo(pageInfo) && isEnableActions && (
        <DropdownItem onClick={bookmarkItemClickedHandler}>
          <i className="fa fa-fw fa-bookmark-o"></i>
          { pageInfo.isBookmarked ? t('remove_bookmark') : t('add_bookmark') }
        </DropdownItem>
      ) }
      { isExistPageInfo(pageInfo) && isEnableActions && (
        <DropdownItem onClick={() => toastr.warning(t('search_result.currently_not_implemented'))}>
          <i className="icon-fw icon-docs"></i>
          {t('Duplicate')}
        </DropdownItem>
      ) }
      { isEnableActions && (
        <DropdownItem onClick={renameItemClickedHandler}>
          <i className="icon-fw  icon-action-redo"></i>
          {t('Move/Rename')}
        </DropdownItem>
      ) }
      { isExistPageInfo(pageInfo) && isEnableActions && (
        <>
          <DropdownItem divider />
          <DropdownItem
            className="text-danger pt-2"
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
    onClickBookmarkMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const shouldFetch = presetPageInfo == null && (!fetchOnOpen || isOpen);
  const { data: fetchedPageInfo } = useSWRxPageInfo(shouldFetch ? pageId : null);

  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      <DropdownToggle color="transparent" className="btn-link border-0 rounded grw-btn-page-management p-0">
        <i className="icon-options fa fa-rotate-90 text-muted p-1"></i>
      </DropdownToggle>

      <PageItemControlDropdownMenu
        pageId={pageId}
        pageInfo={presetPageInfo ?? fetchedPageInfo}
        onClickBookmarkMenuItem={onClickBookmarkMenuItem}
        onClickRenameMenuItem={onClickRenameMenuItem}
        onClickDeleteMenuItem={onClickDeleteMenuItem}
      />
    </Dropdown>
  );

};


type PageItemControlProps = CommonProps & {
  pageId?: string,
}

export const PageItemControl = (props: PageItemControlProps): JSX.Element => {
  const { pageId } = props;

  if (pageId == null) {
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
