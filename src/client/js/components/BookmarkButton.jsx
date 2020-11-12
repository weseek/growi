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

  async handleClick() {
    const { pageContainer } = this.props;

    try {
      pageContainer.toggleBookmark();
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { pageContainer } = this.props;
    const isUserLoggedIn = this.props.appContainer.currentUser != null;

    return (
      <button
        type="button"
        href="#"
        title="Bookmark"
        onClick={this.handleClick}
        className={`btn btn-bookmark border-0
          ${`btn-${this.props.size}`}
          ${pageContainer.state.isBookmarked ? 'active' : ''}`}
        disabled={!isUserLoggedIn}
      >
        <i className="icon-star mr-3"></i>
        <span className="total-bookmarks">
          {pageContainer.state.sumOfBookmarks}
        </span>
      </button>
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
