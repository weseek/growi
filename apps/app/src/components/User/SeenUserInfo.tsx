import React, { FC, useState } from 'react';

import { FootstampIcon } from '@growi/ui/dist/components/FootstampIcon';
import { useTranslation } from 'next-i18next';
import Popover from 'reactstrap/es/Popover';
import PopoverBody from 'reactstrap/es/PopoverBody';
import UncontrolledTooltip from 'reactstrap/es/UncontrolledTooltip';

import { IUser } from '~/interfaces/user';

import UserPictureList from './UserPictureList';


import styles from './SeenUserInfo.module.scss';


interface Props {
  seenUsers: IUser[],
  sumOfSeenUsers?: number,
  disabled?: boolean,
}

const SeenUserInfo: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { seenUsers, sumOfSeenUsers, disabled } = props;

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);

  return (
    <div className={`grw-seen-user-info ${styles['grw-seen-user-info']}`}>
      <button type="button" id="btn-seen-user" className="shadow-none btn btn-seen-user border-0">
        <span className="mr-1 footstamp-icon">
          <FootstampIcon />
        </span>
        <span className="seen-user-count">{sumOfSeenUsers || seenUsers.length}</span>
      </button>
      <Popover placement="bottom" isOpen={isPopoverOpen} target="btn-seen-user" toggle={togglePopover} trigger="legacy" disabled={disabled}>
        <PopoverBody className="user-list-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            <UserPictureList users={seenUsers} />
          </div>
        </PopoverBody>
      </Popover>
      <UncontrolledTooltip data-testid="seen-user-info-tooltip" placement="top" target="btn-seen-user" fade={false}>
        {t('tooltip.footprints')}
      </UncontrolledTooltip>
    </div>
  );
};

export default SeenUserInfo;
