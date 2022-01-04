import React, { FC } from 'react';

import { Types } from 'mongoose';
import { UncontrolledTooltip } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { toastError } from '~/client/util/apiNotification';
import { useIsGuestUser } from '~/stores/context';
import { useSWRxBookmarksInfo } from '~/stores/bookmarks';
import { apiv3Put } from '~/client/util/apiv3-client';

interface Props {
  pageId: Types.ObjectId,
}

const BookmarkButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { pageId } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: bookmarksInfo, mutate } = useSWRxBookmarksInfo(pageId);

  const isBookmarked = bookmarksInfo?.isBookmarked != null ? bookmarksInfo.isBookmarked : false;
  const sumOfBookmarks = bookmarksInfo?.sumOfBookmarks != null ? bookmarksInfo.sumOfBookmarks : 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bookmarkedUserIds = bookmarksInfo?.bookmarkedUserIds != null ? bookmarksInfo.bookmarkedUserIds : [];

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
    <div>
      <button
        type="button"
        id="bookmark-button"
        onClick={handleClick}
        className={`btn btn-bookmark border-0 btn-md
        ${isBookmarked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className="icon-star mr-3"></i>
        <span className="total-bookmarks">
          {sumOfBookmarks}
        </span>
      </button>

      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="bookmark-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </div>
  );
};

export default BookmarkButton;
