import React, { VFC, useState } from 'react';
import {
  Popover, PopoverBody,
} from 'reactstrap';
import UserPictureList from '~/client/js/components/User/UserPictureList';
import { useSeenUsersSWR } from '~/stores/page';
import FootstampIcon from '~/client/js/components/FootstampIcon';

type Props ={
  disabled:boolean
}

export const SeenUserInfo:VFC<Props> = (props:Props) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);
  const { data: seenUsers } = useSeenUsersSWR();
  const countOfSeenUsers:number = (seenUsers == null ? 0 : seenUsers.length);

  return (
    <div className="grw-seen-user-info">
      <button type="button" id="po-seen-user" color="link" className="btn px-2">
        <span className="mr-1 footstamp-icon"><FootstampIcon /></span>
        <span className="seen-user-count">{countOfSeenUsers}</span>
      </button>
      <Popover
        placement="bottom"
        isOpen={popoverOpen}
        target="po-seen-user"
        toggle={toggle}
        trigger="legacy"
        disabled={props.disabled}
      >
        <PopoverBody className="seen-user-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            <UserPictureList users={seenUsers?.slice(0,15)} />
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );
};
