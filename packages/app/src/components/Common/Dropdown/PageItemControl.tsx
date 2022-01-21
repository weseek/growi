import React, { FC, useState } from 'react';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem,
} from 'reactstrap';

import toastr from 'toastr';
import { useTranslation } from 'react-i18next';

import { IPageHasId } from '~/interfaces/page';
import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/apiNotification';
import { useSWRBookmarkInfo } from '~/stores/bookmark';

type PageItemControlProps = {
  page: Partial<IPageHasId>
  isEnableActions: boolean
  isDeletable: boolean
  onClickDeleteButton?: (pageId: string) => void
  onClickRenameButton?: (pageId: string) => void
}

const PageItemControl: FC<PageItemControlProps> = (props: PageItemControlProps) => {

  const {
    page, isEnableActions, onClickDeleteButton, isDeletable, onClickRenameButton,
  } = props;
  const { t } = useTranslation('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(page._id, isOpen);

  const deleteButtonHandler = () => {
    if (onClickDeleteButton != null && page._id != null) {
      onClickDeleteButton(page._id);
    }
  };

  const renameButtonHandler = () => {
    if (onClickRenameButton != null && page._id != null) {
      onClickRenameButton(page._id);
    }
  };


  const bookmarkToggleHandler = (async() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await apiv3Put('/bookmarks', { pageId: page._id, bool: !bookmarkInfo!.isBookmarked });
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  });

  const renderBookmarkText = () => {
    if (bookmarkInfoError != null || bookmarkInfo == null) {
      return '';
    }
    return bookmarkInfo.isBookmarked ? t('remove_bookmark') : t('add_bookmark');
  };


  const dropdownToggle = () => {
    setIsOpen(!isOpen);
  };


  return (
    <Dropdown isOpen={isOpen} toggle={dropdownToggle}>
      <DropdownToggle color="transparent" className="btn-link border-0 rounded grw-btn-page-management p-0">
        <i className="icon-options fa fa-rotate-90 text-muted p-1"></i>
      </DropdownToggle>
      <DropdownMenu positionFixed modifiers={{ preventOverflow: { boundariesElement: undefined } }}>

        {/* TODO: if there is the following button in XD add it here
        <button
          type="button"
          className="btn btn-link p-0"
          value={page.path}
          onClick={(e) => {
            window.location.href = e.currentTarget.value;
          }}
        >
          <i className="icon-login" />
        </button>
        */}

        {/*
          TODO: add function to the following buttons like using modal or others
          ref: https://estoc.weseek.co.jp/redmine/issues/79026
        */}

        {/* TODO: show dropdown when permalink section is implemented */}

        {!isEnableActions && (
          <DropdownItem>
            <p>
              {t('search_result.currently_not_implemented')}
            </p>
          </DropdownItem>
        )}
        {isEnableActions && (
          <DropdownItem onClick={bookmarkToggleHandler}>
            <i className="fa fa-fw fa-bookmark-o"></i>
            {renderBookmarkText()}
          </DropdownItem>
        )}
        {isEnableActions && (
          <DropdownItem onClick={() => toastr.warning(t('search_result.currently_not_implemented'))}>
            <i className="icon-fw icon-docs"></i>
            {t('Duplicate')}
          </DropdownItem>
        )}
        {isEnableActions && (
          <DropdownItem onClick={renameButtonHandler}>
            <i className="icon-fw  icon-action-redo"></i>
            {t('Move/Rename')}
          </DropdownItem>
        )}
        {isDeletable && isEnableActions && (
          <>
            <DropdownItem divider />
            <DropdownItem className="text-danger pt-2" onClick={deleteButtonHandler}>
              <i className="icon-fw icon-trash"></i>
              {t('Delete')}
            </DropdownItem>
          </>
        )}
      </DropdownMenu>


    </Dropdown>
  );

};

export default PageItemControl;
