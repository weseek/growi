import React, { FC, useState } from 'react';

import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import UserPictureList from './User/UserPictureList';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '~/client/services/AppContainer';
import { useSWRPageInfo } from '../stores/page';
import { IUser } from '../interfaces/user';

type LegacyLikeButtonsProps = {
  appContainer: AppContainer,
  likerIds: string[],
  sumOfLikers: number,
  isLiked: boolean,
  pageId: string,
  likers: IUser[],
  onLikeClicked?: ()=>void,
  t: (s:string)=>string,
}

// TODO : user image not displayed in search page. Fix it.
// task : https://estoc.weseek.co.jp/redmine/issues/81110
const LegacyLikeButtons: FC<LegacyLikeButtonsProps> = (props: LegacyLikeButtonsProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { data: pageInfo } = useSWRPageInfo(props.pageId);

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
    appContainer, t,
  } = props;
  const { isGuestUser } = appContainer;

  return (
    <div className="btn-group" role="group" aria-label="Like buttons">
      <button
        type="button"
        id="like-button"
        onClick={handleClick}
        className={`btn btn-like border-0
            ${pageInfo?.isLiked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
      >
        <i className="icon-like"></i>
      </button>
      {isGuestUser && (
        <UncontrolledTooltip placement="top" target="like-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}

      <button type="button" id="po-total-likes" className={`btn btn-like border-0 total-likes ${pageInfo?.isLiked ? 'active' : ''}`}>
        {pageInfo?.sumOfLikers}
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
const LegacyLikeButtonsWrapper = withUnstatedContainers(LegacyLikeButtons, [AppContainer]);

const LikeButtons = (props) => {
  return <LegacyLikeButtonsWrapper {...props}></LegacyLikeButtonsWrapper>;
};

export default withTranslation()(LikeButtons);
