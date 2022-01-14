import React, { FC, useState } from 'react';

import { Button, Popover, PopoverBody } from 'reactstrap';

import UserPictureList from './UserPictureList';
import FootstampIcon from '../FootstampIcon';
import { useSWRxPageInfo } from '~/stores/page';
import { useSWRxUsersList } from '~/stores/user';

interface Props {
  pageId: string,
  disabled: boolean
}

const SeenUserInfo: FC<Props> = (props: Props) => {
  const { pageId, disabled } = props;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: pageInfo } = useSWRxPageInfo(pageId);
  const likerIds = pageInfo?.likerIds != null ? pageInfo.likerIds.slice(0, 15) : [];
  const seenUserIds = pageInfo?.seenUserIds != null ? pageInfo.seenUserIds.slice(0, 15) : [];

  // Put in a mixture of seenUserIds and likerIds data to make the cache work
  const { data: usersList } = useSWRxUsersList([...likerIds, ...seenUserIds]);
  const seenUsers = usersList != null ? usersList.filter(({ _id }) => seenUserIds.includes(_id)).slice(0, 30) : [];

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);

  return (
    <div className="grw-seen-user-info">
      <Button id="po-seen-user" color="link" className="px-2">
        <span className="mr-1 footstamp-icon">
          <FootstampIcon />
        </span>
        <span className="seen-user-count">{seenUsers.length}</span>
      </Button>
      <Popover placement="bottom" isOpen={isPopoverOpen} target="po-seen-user" toggle={togglePopover} trigger="legacy" disabled={disabled}>
        <PopoverBody className="seen-user-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            <UserPictureList users={seenUsers} />
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );
};

export default SeenUserInfo;
