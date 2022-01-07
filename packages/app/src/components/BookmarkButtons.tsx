import React, { FC, useState } from 'react';

import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import UserPictureList from './User/UserPictureList';
import { toastError } from '~/client/util/apiNotification';
import { usePageId, useIsGuestUser } from '~/stores/context';
import { useSWRxBookmarksInfo } from '~/stores/bookmarks';
import { apiv3Put } from '~/client/util/apiv3-client';


const BookmarkButton: FC = () => {
  const { t } = useTranslation();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: pageId } = usePageId();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: bookmarksInfo, mutate } = useSWRxBookmarksInfo(pageId);

  const isBookmarked = bookmarksInfo?.isBookmarked != null ? bookmarksInfo.isBookmarked : false;
  const sumOfBookmarks = bookmarksInfo?.sumOfBookmarks != null ? bookmarksInfo.sumOfBookmarks : 0;
  const bookmarkedUsers = bookmarksInfo?.bookmarkedUsers != null ? bookmarksInfo.bookmarkedUsers : [];

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleClick = async() => {
    if (isGuestUser) {
      return;
    }

    try {
      const res = await apiv3Put('/bookmarks', { pageId, bool: !isBookmarked });
      if (res) {
        mutate();
      }
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="btn-group" role="group" aria-label="Bookmark buttons">
      <button
        type="button"
        id="bookmark-button"
        onClick={handleClick}
        className={`btn btn-bookmark border-0
          ${isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className="icon-star"></i>
      </button>

      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}

      <button type="button" id="po-total-bookmarks" className={`btn btn-bookmark border-0 total-bookmarks ${isBookmarked ? 'active' : ''}`}>
        {sumOfBookmarks}
      </button>

      <Popover placement="bottom" isOpen={isPopoverOpen} target="po-total-bookmarks" toggle={togglePopover} trigger="legacy">
        <PopoverBody className="seen-user-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            {bookmarkedUsers.length ? <UserPictureList users={bookmarkedUsers} /> : t('No users have bookmarked yet')}
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );
};

export default BookmarkButton;
