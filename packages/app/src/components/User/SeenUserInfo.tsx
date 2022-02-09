import React, { FC, useState } from 'react';

import { Popover, PopoverBody } from 'reactstrap';
import { FootstampIcon } from '@growi/ui';

import { IUser } from '~/interfaces/user';

import UserPictureList from './UserPictureList';

interface Props {
  seenUsers: IUser[],
  disabled?: boolean,
}

const SeenUserInfo: FC<Props> = (props: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { seenUsers, disabled } = props;

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);

  return (
    <div className="grw-seen-user-info">
      <button type="button" id="btn-seen-user" className="btn btn-seen-user border-0">
        <span className="mr-1 footstamp-icon">
          <FootstampIcon />
        </span>
        <span className="seen-user-count">{seenUsers.length}</span>
      </button>
      <Popover placement="bottom" isOpen={isPopoverOpen} target="btn-seen-user" toggle={togglePopover} trigger="legacy" disabled={disabled}>
        <PopoverBody className="user-list-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            <UserPictureList users={seenUsers} />
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );
};

export default SeenUserInfo;
