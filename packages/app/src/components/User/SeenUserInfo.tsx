import React, { FC, useState } from 'react';

import { Button, Popover, PopoverBody } from 'reactstrap';
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
      <Button id="btn-seen-user" color="link" className="btn-seen-user">
        <span className="mr-1 footstamp-icon">
          <FootstampIcon />
        </span>
        <span className="seen-user-count">{seenUsers.length}</span>
      </Button>
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
