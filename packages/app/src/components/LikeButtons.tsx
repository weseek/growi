import React, { FC, useState } from 'react';

import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import UserPictureList from './User/UserPictureList';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '~/client/services/AppContainer';
import { IUser } from '../interfaces/user';

type LikeButtonsProps = {
  appContainer: AppContainer,
  sumOfLikers: number,
  isLiked: boolean,
  likers: IUser[],
  onLikeClicked?: ()=>void,
  t: (s:string)=>string,
}

const LikeButtons: FC<LikeButtonsProps> = (props: LikeButtonsProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };


  const handleClick = () => {
    if (props.onLikeClicked == null) {
      return;
    }
    props.onLikeClicked();
  };

  const {
    appContainer, isLiked, sumOfLikers, t,
  } = props;
  const { isGuestUser } = appContainer;

  return (
    <div className="btn-group" role="group" aria-label="Like buttons">
      <button
        type="button"
        id="like-button"
        onClick={handleClick}
        className={`btn btn-like border-0
            ${isLiked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className="icon-like"></i>
      </button>
      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="like-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}

      <button type="button" id="po-total-likes" className={`btn btn-like border-0 total-likes ${isLiked ? 'active' : ''}`}>
        {sumOfLikers}
      </button>
      <Popover placement="bottom" isOpen={isPopoverOpen} target="po-total-likes" toggle={togglePopover} trigger="legacy">
        <PopoverBody className="seen-user-popover">
          <div className="px-2 text-right user-list-content text-truncate text-muted">
            {props.likers.length ? <UserPictureList users={props.likers} /> : t('No users have liked this yet.')}
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const LikeButtonsUnstatedWrapper = withUnstatedContainers(LikeButtons, [AppContainer]);

const LikeButtonsWrapper = (props) => {
  return <LikeButtonsUnstatedWrapper {...props}></LikeButtonsUnstatedWrapper>;
};

export default withTranslation()(LikeButtonsWrapper);
