import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '../util/apiNotification';
import PageContainer from '../services/PageContainer';
import AppContainer from '../services/AppContainer';

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
    const { pageContainer, t } = this.props;

    return (
      <div className="d-inline-block" tabIndex="0" data-toggle="tooltip" title={!pageContainer.state.isGuestUser ? 'Bookmark' : t('Not available for guest')}>
        <button
          type="button"
          onClick={this.handleClick}
          className={`btn btn-bookmark border-0
          ${`btn-${this.props.size}`}
          ${pageContainer.state.isBookmarked ? 'active' : ''}`}
          disabled={pageContainer.state.isGuestUser}
        >
          <i className="icon-star mr-3"></i>
          <span className="total-bookmarks">
            {pageContainer.state.sumOfBookmarks}
          </span>
        </button>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const BookmarkButtonWrapper = withUnstatedContainers(BookmarkButton, [AppContainer, PageContainer]);

BookmarkButton.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  pageId: PropTypes.string,
  t: PropTypes.func.isRequired,
  size: PropTypes.string,
};

BookmarkButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(BookmarkButtonWrapper);
