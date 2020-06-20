import React from 'react';
import PropTypes from 'prop-types';

import { toastError } from '../util/apiNotification';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

class LikeButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLiked: props.isLiked,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { appContainer, pageId } = this.props;
    const bool = !this.state.isLiked;
    try {
      await appContainer.apiv3.put('/page/likes', { pageId, bool });
      this.setState({ isLiked: bool });
    }
    catch (err) {
      toastError(err);
    }
  }

  isUserLoggedIn() {
    return this.props.appContainer.currentUserId != null;
  }

  render() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      return <div></div>;
    }

    return (
      <button
        type="button"
        onClick={this.handleClick}
        className={`btn rounded-circle btn-like border-0 d-edit-none
        ${this.state.isLiked ? 'btn-info active' : 'btn-outline-info'}`}
      >
        <i className="icon-like"></i>
      </button>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LikeButtonWrapper = withUnstatedContainers(LikeButton, [AppContainer]);

LikeButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string,
  isLiked: PropTypes.bool,
  size: PropTypes.string,
};

export default LikeButtonWrapper;
