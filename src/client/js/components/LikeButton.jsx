import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '../util/apiNotification';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class LikeButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { pageContainer } = this.props;
    try {
      pageContainer.toggleLike();
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { pageContainer, t } = this.props;
    const isGuestUser = pageContainer.state.isGuestUser;

    return (
      <div className="d-inline-block" tabIndex="0" data-toggle="tooltip" title={!isGuestUser ? 'Like' : t('Not available for guest')}>
        <button
          type="button"
          onClick={this.handleClick}
          className={`btn btn-like border-0
          ${pageContainer.state.isLiked ? 'active' : ''}`}
          disabled={isGuestUser}
        >
          <i className="icon-like mr-3"></i>
          <span className="total-likes">
            {pageContainer.state.sumOfLikers}
          </span>
        </button>
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
