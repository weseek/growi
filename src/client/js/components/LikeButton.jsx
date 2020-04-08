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

  async componentDidMount() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      // do nothing
      return;
    }

    const { appContainer, pageId } = this.props;

    try {
      const res = await appContainer.apiGet('/bookmarks.get', { page_id: pageId });
      console.log(res);
      if (res.bookmark) {
        this.setState({ isLiked: true });
      }
    }
    catch (err) {
      toastError(err);
    }
  }

  async handleClick() {
    const { appContainer, pageId } = this.props;
    const { isLiked } = this.state;

    if (!isLiked) {
      try {
        await appContainer.apiPost('/likes.add', { page_id: pageId });
        this.setState({ isLiked: true });
      }
      catch (err) {
        toastError(err);
      }
    }
    else {
      try {
        await appContainer.apiPost('/likes.remove', { page_id: pageId });
        this.setState({ isLiked: false });
      }
      catch (err) {
        toastError(err);
      }
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
