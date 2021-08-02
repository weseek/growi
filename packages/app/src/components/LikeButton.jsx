import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

class LikeButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
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

    return (
      <div>
        <button
          type="button"
          id="like-button"
          onClick={this.handleClick}
          className={`btn btn-like border-0
          ${pageContainer.state.isLiked ? 'active' : ''} ${isGuestUser ? 'disabled' : ''}`}
        >
          <i className="icon-like mr-3"></i>
          <span className="total-likes">
            {pageContainer.state.sumOfLikers}
          </span>
        </button>

        {isGuestUser && (
          <UncontrolledTooltip placement="top" target="like-button" fade={false}>
            {t('Not available for guest')}
          </UncontrolledTooltip>
        )}
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LikeButtonWrapper = withUnstatedContainers(LikeButton, [AppContainer, PageContainer]);

LikeButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

export default withTranslation()(LikeButtonWrapper);
