import React from 'react';
import PropTypes from 'prop-types';

import { toastError } from '../util/apiNotification';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

class LikeButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const { appContainer, pageContainer } = this.props;
    const pageId = pageContainer.state.pageId;
    const bool = !pageContainer.state.isLiked;
    try {
      await appContainer.apiv3.put('/page/likes', { pageId, bool });
      if (pageContainer.state.isLiked) {
        pageContainer.setState({ sumOfLikers: pageContainer.state.sumOfLikers - 1 });
      }
      else {
        pageContainer.setState({ sumOfLikers: pageContainer.state.sumOfLikers + 1 });
      }
      pageContainer.setState({ isLiked: bool });
    }
    catch (err) {
      toastError(err);
    }
  }

  isUserLoggedIn() {
    return this.props.appContainer.currentUserId != null;
  }

  render() {
    const { pageContainer } = this.props;
    // if guest user
    if (!this.isUserLoggedIn()) {
      return <div></div>;
    }

    return (
      <div className="d-flex">
        <button
          type="button"
          onClick={this.handleClick}
          className={`btn rounded-circle btn-like border-0 d-edit-none
        ${pageContainer.state.isLiked ? 'active' : ''}`}
        >
          <i className="icon-like"></i>
        </button>
        <div className="total-likes">
          {pageContainer.state.sumOfLikers}
        </div>
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

  size: PropTypes.string,
};

export default LikeButtonWrapper;
