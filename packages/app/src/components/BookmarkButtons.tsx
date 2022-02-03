import React, { FC, useState } from 'react';

import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { IUser } from '../interfaces/user';

import UserPictureList from './User/UserPictureList';
import { useIsGuestUser } from '~/stores/context';

interface Props {
  hideTotalNumber?: boolean
  isBookmarked: boolean
  sumOfBookmarks: number
  bookmarkedUsers: IUser[]
  onBookMarkClicked: ()=>void;
}

const BookmarkButtons: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: isGuestUser } = useIsGuestUser();

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleClick = async() => {
    if (props.onBookMarkClicked != null) {
      props.onBookMarkClicked();
    }
  };

  return (
    <div className="btn-group" role="group" aria-label="Bookmark buttons">
      <button
        type="button"
        id="bookmark-button"
        onClick={handleClick}
        className={`btn btn-bookmark border-0
          ${props.isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className={`fa ${props.isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
      </button>

      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}

      { !props.hideTotalNumber && (
        <>
          <button type="button" id="po-total-bookmarks" className={`btn btn-bookmark border-0 total-bookmarks ${props.isBookmarked ? 'active' : ''}`}>
            {props.sumOfBookmarks}
          </button>
          <Popover placement="bottom" isOpen={isPopoverOpen} target="po-total-bookmarks" toggle={togglePopover} trigger="legacy">
            <PopoverBody className="user-list-popover">
              <div className="px-2 text-right user-list-content text-truncate text-muted">
                {props.bookmarkedUsers.length ? <UserPictureList users={props.bookmarkedUsers} /> : t('No users have bookmarked yet')}
              </div>
            </PopoverBody>
          </Popover>
        </>
      ) }
    </div>
  );
};

export default BookmarkButtons;
