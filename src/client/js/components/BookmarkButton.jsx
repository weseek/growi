import React from 'react';
import PropTypes from 'prop-types';

import { toastError } from '../util/apiNotification';
import { withUnstatedContainers } from './UnstatedUtils';
import PageContainer from '../services/PageContainer';

class BookmarkButton extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    const { pageId, crowi, pageContainer } = this.props;
    // if guest user
    if (!this.isUserLoggedIn()) {
      // do nothing
      return;
    }

    try {
      const response = await crowi.apiv3.get('/bookmarks', { pageId });
      if (response.data.bookmark.page != null) {
        pageContainer.setState({ isBookmarked: true });
        pageContainer.setState({ sumOfBookmarks: response.data.bookmark.sumOfBookmarks });
      }
    }
    catch (err) {
      toastError(err);
    }

  }

  async handleClick() {
    const { crowi, pageId, pageContainer } = this.props;
    const bool = !pageContainer.state.isBookmarked;

    try {
      await crowi.apiv3.put('/bookmarks', { pageId, bool });
      pageContainer.setState({ isBookmarked: bool });
    }
    catch (err) {
      toastError(err);
    }
  }

  isUserLoggedIn() {
    return this.props.crowi.currentUserId != null;
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
          className={`btn rounded-circle btn-bookmark border-0 d-edit-none
          ${`btn-${this.props.size}`}
          ${pageContainer.state.isBookmarked ? 'active' : ''}`}
        >
          <i className="icon-star"></i>
        </button>
        <div className="total-bookmarks">
          {pageContainer.state.sumOfBookmarks}
        </div>
      </div>
    );
  }

}

const BookmarkButtonWrapper = withUnstatedContainers(BookmarkButton, [PageContainer]);

BookmarkButton.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  pageId: PropTypes.string,
  crowi: PropTypes.object.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default BookmarkButtonWrapper;
