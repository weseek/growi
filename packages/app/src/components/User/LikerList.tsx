import React, { FC } from 'react';

import UserPictureList from './UserPictureList';
import { useSWRxPageInfo } from '~/stores/page';
import { useSWRxUsersList } from '~/stores/user';

interface Props {
  pageId: string,
}

const LikerList: FC<Props> = (props: Props) => {
  const { pageId } = props;

  const { data: pageInfo } = useSWRxPageInfo(pageId);
  const sumOfLikers = pageInfo?.sumOfLikers != null ? pageInfo.sumOfLikers : 0;
  const likerIds = pageInfo?.likerIds != null ? pageInfo.likerIds.slice(0, 15) : [];
  const seenUserIds = pageInfo?.seenUserIds != null ? pageInfo.seenUserIds.slice(0, 15) : [];

  // Put in a mixture of seenUserIds and likerIds data to make the cache work
  const { data: usersList } = useSWRxUsersList([...likerIds, ...seenUserIds]);
  const likers = usersList != null ? usersList.filter(({ _id }) => likerIds.includes(_id)).slice(0, 15) : [];

  return (
    <div className="user-list-content text-truncate text-muted text-right">
      <span className="text-info">
        <span className="liker-user-count">{sumOfLikers}</span>
        <i className="icon-fw icon-like"></i>
      </span>
      <span className="mr-1">
        <UserPictureList users={likers} />
      </span>
    </div>
  );
};

export default LikerList;
