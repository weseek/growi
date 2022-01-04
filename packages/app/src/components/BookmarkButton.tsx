import React, {
  FC, useState, useCallback, useEffect,
} from 'react';

import { Types } from 'mongoose';
import { UncontrolledTooltip } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { toastError } from '~/client/util/apiNotification';
import { useIsGuestUser } from '~/stores/context';
import { apiv3Get, apiv3Put } from '~/client/util/apiv3-client';

interface Props {
  pageId: Types.ObjectId,
  // isBookmarked: boolean
  // sumOfBookmarks: number
}

const BookmarkButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { pageId } = props;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sumOfBookmarks, setSumOfBookmarks] = useState(0);
  const { data: isGuestUser } = useIsGuestUser();

  // TODO 84997 Get "/bookmarks/info" with SWR
  const bookmarksInfo = useCallback(async() => {
    const { data } = await apiv3Get('/bookmarks/info', { pageId });
    if (data != null) {
      setIsBookmarked(data.isBookmarked);
      setSumOfBookmarks(data.sumOfBookmarks);
    }
  }, [pageId]);

  const handleClick = async() => {

    if (isGuestUser) {
      return;
    }

    try {
      const res = await apiv3Put('/bookmarks', { pageId, bool: !isBookmarked });
      if (res != null) {
        await bookmarksInfo();
      }
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    bookmarksInfo();
  }, [bookmarksInfo]);

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
