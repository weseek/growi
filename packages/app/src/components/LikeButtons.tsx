import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip, Popover, PopoverBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import UserPictureList from './User/UserPictureList';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

class LikeButtons extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isPopoverOpen: false,
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  togglePopover() {
    this.setState(prevState => ({
      ...prevState,
      isPopoverOpen: !prevState.isPopoverOpen,
    }));
  }

  async handleClick() {
    const { appContainer, pageContainer } = this.props;
    const { isGuestUser } = appContainer;

    if (isGuestUser) {
      return;
    }

    try {
      pageContainer.toggleLike();
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { appContainer, pageContainer, t } = this.props;
    const { isGuestUser } = appContainer;
    const {
      state: { likers, sumOfLikers, isLiked },
    } = pageContainer;

    return (
      <div className="btn-group" role="group" aria-label="Like buttons">
        <button
          type="button"
          id="like-button"
          onClick={this.handleClick}
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
        <Popover placement="bottom" isOpen={this.state.isPopoverOpen} target="po-total-likes" toggle={this.togglePopover} trigger="legacy">
          <PopoverBody className="seen-user-popover">
            <div className="px-2 text-right user-list-content text-truncate text-muted">
              {likers.length ? <UserPictureList users={likers} /> : t('No users have liked this yet.')}
            </div>
          </PopoverBody>
        </Popover>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LikeButtonsWrapper = withUnstatedContainers(LikeButtons, [AppContainer, PageContainer]);

LikeButtons.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

export default withTranslation()(LikeButtonsWrapper);
