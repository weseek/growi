import React from 'react';
import PropTypes from 'prop-types';

import { toastError } from '../util/apiNotification';
import { createSubscribedElement } from './UnstatedUtils';
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
    const { isLiked } = this.state;
    try {
      await appContainer.apiv3.put('/page/likes', { pageId, isLiked });
      this.setState({ isLiked: !isLiked });
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
        className={`btn btn-circle btn-outline-info btn-like border-0 ${this.state.isLiked ? 'active' : ''}`}
      >
        <i className="icon-like"></i>
      </button>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LikeButtonWrapper = (props) => {
  return createSubscribedElement(LikeButton, props, [AppContainer]);
};

LikeButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string,
  isLiked: PropTypes.bool,
  size: PropTypes.string,
};

export default LikeButtonWrapper;
