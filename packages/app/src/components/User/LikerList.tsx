import React, { FC } from 'react';

import UserPictureList from './UserPictureList';

import { usePageId } from '~/stores/context';
import { useSWRxPageInfo } from '~/stores/page';

const LikerList: FC = () => {
  const { data: pageId } = usePageId();
  const { data: pageInfo } = useSWRxPageInfo(pageId);

  const liker = pageInfo?.liker ? pageInfo.liker : 0;
  const sumOfLikers = pageInfo?.sumOfLikers ? pageInfo.sumOfLikers : 0;

  return (
    <div className="user-list-content text-truncate text-muted text-right">
      <span className="text-info">
        <span className="liker-user-count">{sumOfLikers}</span>
        <i className="icon-fw icon-like"></i>
      </span>
      <span className="mr-1">
        <UserPictureList users={liker} />
      </span>
    </div>
  );
};

export default LikerList;
