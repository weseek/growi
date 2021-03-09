import React, { VFC, useState } from 'react';
import {
  Popover, PopoverBody,
} from 'reactstrap';
import UserPictureList from '~/client/js/components/User/UserPictureList';
import { useCurrentPageSeenUsersSWR, useCurrentPageSWR } from '~/stores/page';
import FootstampIcon from '~/client/js/components/FootstampIcon';

type Props ={
  disabled:boolean
}

export const SeenUserInfo:VFC<Props> = (props:Props) => {
  const { data: currentPage } = useCurrentPageSWR();
  const { data: seenUsersLimited } = useCurrentPageSeenUsersSWR(-15);

  const [popoverOpen, setPopoverOpen] = useState(false);

  const countOfSeenUsers = currentPage?.seenUsers.length;
  const renderPopover = seenUsersLimited != null && seenUsersLimited?.length > 0;

  return (
    <div className="grw-seen-user-info">
      <button type="button" id="po-seen-user" color="link" className="btn px-2">
        <span className="mr-1 footstamp-icon"><FootstampIcon /></span>
        <span className="seen-user-count">{countOfSeenUsers}</span>
      </button>
      { renderPopover && (
        <Popover
          placement="bottom"
          isOpen={popoverOpen}
          target="po-seen-user"
          toggle={() => setPopoverOpen(!popoverOpen)}
          trigger="legacy"
          disabled={props.disabled}
        >
          <PopoverBody className="seen-user-popover">
            <div className="px-2 text-right user-list-content text-truncate text-muted">
              <UserPictureList users={seenUsersLimited} />
            </div>
          </PopoverBody>
        </Popover>
      ) }
    </div>
  );
};
