import React, { FC, useState } from 'react';

import { Types } from 'mongoose';
import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import loggerFactory from '~/utils/logger';

import { IUser } from '~/interfaces/user';
import { HasObjectId } from '~/interfaces/has-object-id';
import UserPictureList from './User/UserPictureList';
import { toastError } from '~/client/util/apiNotification';
import { useIsGuestUser } from '~/stores/context';
import { useSWRxPageInfo } from '~/stores/page';
import { useSWRxUsersList } from '~/stores/user';
import { apiv3Put } from '~/client/util/apiv3-client';

const logger = loggerFactory('growi:LikeButtons');
interface Props {
  pageId: Types.ObjectId,
}

const LikeButtons: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { pageId } = props;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: isGuestUser } = useIsGuestUser();

  const { data: pageInfo, mutate } = useSWRxPageInfo(pageId);
  const isLiked = pageInfo?.isLiked != null ? pageInfo.isLiked : false;
  const sumOfLikers = pageInfo?.sumOfLikers != null ? pageInfo.sumOfLikers : 0;
  const likerIds = pageInfo?.likerIds != null ? pageInfo.likerIds : [];
  const seenUserIds = pageInfo?.seenUserIds != null ? pageInfo.seenUserIds : [];

  const { data: usersList } = useSWRxUsersList([...likerIds, ...seenUserIds].join());
  const likers = usersList != null ? usersList.filter(({ _id }) => likerIds.includes(_id)).slice(0, 15) : [];

  const checkAndUpdateImageUrlCached = async(users: IUser[]) => {
    const noImageCacheUsers = users.filter((user) => { return user.imageUrlCached == null });
    if (noImageCacheUsers.length === 0) {
      return;
    }

    const noImageCacheUserIds = noImageCacheUsers.map((user: IUser & HasObjectId) => { return user._id });
    try {
      await apiv3Put('/users/update.imageUrlCache', { userIds: noImageCacheUserIds });
    }
    catch (err) {
      // Error alert doesn't apear, because user don't need to notice this error.
      logger.error(err);
    }
  };

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleClick = async() => {
    if (isGuestUser) {
      return;
    }

    try {
      const res = await apiv3Put('/page/likes', { pageId, bool: !isLiked });
      if (res) {
        mutate();
      }
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="btn-group" role="group" aria-label="Like buttons">
      <button
        type="button"
        id="like-button"
        onClick={handleClick}
        className={`btn btn-like border-0
          ${isLiked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className="icon-like"></i>
      </button>

      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="like-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}

      <button type="button" id="po-total-likes" className={`btn btn-like border-0 total-likes ${isLiked ? 'active' : ''}`}>
        {sumOfLikers}
      </button>

      <Popover placement="bottom" isOpen={isPopoverOpen} target="po-total-likes" toggle={togglePopover} trigger="legacy">
        <PopoverBody className="seen-user-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            {likers.length ? <UserPictureList users={likers} /> : t('No users have liked this yet')}
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );
};

export default LikeButtons;
