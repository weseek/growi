import React, { FC, useState, useCallback } from 'react';

import type { IUser } from '@growi/core';
import { useTranslation } from 'next-i18next';
import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';


import UserPictureList from './User/UserPictureList';

import styles from './LikeButtons.module.scss';

type LikeButtonsProps = {

  sumOfLikers: number,
  likers: IUser[],

  isGuestUser?: boolean,
  isLiked?: boolean,
  onLikeClicked?: ()=>void,
}

const LikeButtons: FC<LikeButtonsProps> = (props: LikeButtonsProps) => {
  const { t } = useTranslation();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const {
    isGuestUser, isLiked, sumOfLikers, onLikeClicked,
  } = props;

  const getTooltipMessage = useCallback(() => {

    if (isLiked) {
      return 'tooltip.cancel_like';
    }
    return 'tooltip.like';
  }, [isLiked]);

  return (
    <div className={`btn-group btn-group-like ${styles['btn-group-like']}`} role="group" aria-label="Like buttons">
      <button
        type="button"
        id="like-button"
        onClick={onLikeClicked}
        className={`shadow-none btn btn-like border-0
            ${isLiked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className={`fa ${isLiked ? 'fa-heart' : 'fa-heart-o'}`}></i>
      </button>

      <UncontrolledTooltip data-testid="like-button-tooltip" placement="top" target="like-button" autohide={false} fade={false}>
        {t(getTooltipMessage())}
      </UncontrolledTooltip>

      <button
        type="button"
        id="po-total-likes"
        className={`shadow-none btn btn-like border-0
          total-likes ${isLiked ? 'active' : ''}`}
      >
        {sumOfLikers}
      </button>
      <Popover placement="bottom" isOpen={isPopoverOpen} target="po-total-likes" toggle={togglePopover} trigger="legacy">
        <PopoverBody className="user-list-popover">
          <div className="px-2 text-end user-list-content text-truncate text-muted">
            {props.likers?.length ? <UserPictureList users={props.likers} /> : t('No users have liked this yet.')}
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );

};

export default LikeButtons;
