import React, {
  FC, useState, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  UncontrolledTooltip, Popover, PopoverBody, DropdownToggle,
} from 'reactstrap';

import { useIsGuestUser } from '~/stores/context';

import { IUser } from '../interfaces/user';

import BookmarkFolderMenu from './Bookmarks/BookmarkFolderMenu';
import UserPictureList from './User/UserPictureList';

import styles from './BookmarkButtons.module.scss';

interface Props {
  bookmarkCount?: number
  isBookmarked?: boolean
  bookmarkedUsers?: IUser[]
  hideTotalNumber?: boolean
}

const BookmarkButtons: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const {
    bookmarkCount, isBookmarked, bookmarkedUsers, hideTotalNumber,
  } = props;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: isGuestUser } = useIsGuestUser();

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const getTooltipMessage = useCallback(() => {
    if (isGuestUser) {
      return 'Not available for guest';
    }

    if (isBookmarked) {
      return 'tooltip.cancel_bookmark';
    }
    return 'tooltip.bookmark';
  }, [isGuestUser, isBookmarked]);


  return (
    <div className={`btn-group btn-group-bookmark ${styles['btn-group-bookmark']}`} role="group" aria-label="Bookmark buttons">
      <BookmarkFolderMenu >
        <DropdownToggle id='bookmark-dropdown-btn' color="transparent" className={`shadow-none btn btn-bookmark border-0
          ${isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}>
          <i className={`fa ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
        </DropdownToggle>
      </BookmarkFolderMenu>

      <UncontrolledTooltip placement="top" target="bookmark-dropdown-btn" fade={false}>
        {t(getTooltipMessage())}
      </UncontrolledTooltip>

      { !hideTotalNumber && (
        <>
          <button
            type="button"
            id="po-total-bookmarks"
            className={`shadow-none btn btn-bookmark border-0
              total-bookmarks ${props.isBookmarked ? 'active' : ''}`}
          >
            {bookmarkCount ?? 0}
          </button>
          { bookmarkedUsers != null && (
            <Popover placement="bottom" isOpen={isPopoverOpen} target="po-total-bookmarks" toggle={togglePopover} trigger="legacy">
              <PopoverBody className="user-list-popover">
                <div className="px-2 text-right user-list-content text-truncate text-muted">
                  {bookmarkedUsers.length ? <UserPictureList users={props.bookmarkedUsers} /> : t('No users have bookmarked yet')}
                </div>
              </PopoverBody>
            </Popover>
          ) }
        </>
      ) }
    </div>
  );
};

export default BookmarkButtons;
