import React, { FC, useState } from 'react';
import { Button, Popover, PopoverBody } from 'reactstrap';
import UserPictureList from './UserPictureList';

import FootstampIcon from '../FootstampIcon';

import { usePageId } from '~/stores/context';
import { useSWRxPageInfo } from '~/stores/page';

interface Props {
  disabled: boolean
}

const SeenUserInfo: FC<Props> = (props: Props) => {
  const { disabled } = props;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: pageId } = usePageId();
  const { data: pageInfo } = useSWRxPageInfo(pageId);

  const seenUsers = pageInfo?.seenUsers ? pageInfo.seenUsers : [];

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
