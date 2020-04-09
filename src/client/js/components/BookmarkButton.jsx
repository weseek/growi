import React from 'react';
import PropTypes from 'prop-types';

import { toastError } from '../util/apiNotification';
import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isBookmarked: false,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      // do nothing
      return;
    }

    this.props.crowi.apiGet('/bookmarks.get', { page_id: this.props.pageId })
      .then((res) => {
        if (res.bookmark) {
          this.setState({ isBookmarked: true });
        }
      });
  }

  async handleClick() {
    const { appContainer, pageId } = this.props;
    const bool = !this.state.isBookmarked;

    try {
      await appContainer.apiv3.put('/bookmarks', { pageId, bool });
      this.setState({ isBookmarked: bool });
    }
    catch (err) {
      toastError(err);
    }
  }

  isUserLoggedIn() {
    return this.props.crowi.currentUserId != null;
  }

  render() {
    // if guest user
    if (!this.isUserLoggedIn()) {
      return <div></div>;
    }

    return (
      <button
        type="button"
        href="#"
        title="Bookmark"
        onClick={this.handleClick}
        className={`btn btn-circle btn-outline-warning btn-bookmark border-0 ${this.state.bookmarked ? 'active' : ''}`}
      >
        <i className="icon-star"></i>
      </button>
    );
  }

}

BookmarkButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string,
  crowi: PropTypes.object.isRequired,
  size: PropTypes.string,
};

/**
 * Wrapper component for using unstated
 */
const BookmarkButtonWrapper = (props) => {
  return createSubscribedElement(BookmarkButton, props, [AppContainer]);
};

export default BookmarkButtonWrapper;
