import React from 'react';
import PropTypes from 'prop-types';

import { toastError } from '../util/apiNotification';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isBookmarked: false,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    const { pageId, crowi } = this.props;
    // if guest user
    if (!this.isUserLoggedIn()) {
      // do nothing
      return;
    }

    try {
      const response = await crowi.apiv3.get('/bookmarks', { pageId });
      if (response.data.bookmark != null) {
        this.setState({ isBookmarked: true });
      }
    }
    catch (err) {
      toastError(err);
    }

  }

  async handleClick() {
    const { crowi, pageId } = this.props;
    const bool = !this.state.isBookmarked;

    try {
      await crowi.apiv3.put('/bookmarks', { pageId, bool });
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
        className={`btn rounded-circle btn-bookmark border-0 d-edit-none
          ${`btn-${this.props.size}`}
          ${this.state.isBookmarked ? 'btn-warning active' : 'btn-outline-warning'}`}
      >
        <i className="icon-star"></i>
      </button>
    );
  }

}

BookmarkButton.propTypes = {
  pageId: PropTypes.string,
  crowi: PropTypes.object.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default BookmarkButton;
